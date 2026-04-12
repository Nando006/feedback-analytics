import { runIaAnalyzeAnalysis } from './iaAnalyzeGatewayClient.js';
import { IaAnalyzeServiceError } from './iaAnalyzeErrors.js';
import {
  fetchAlreadyAnalyzedFeedbackIds,
  type CollectingDataContext,
  fetchEnterpriseContextForAnalysis,
  fetchFeedbacksForAnalysis,
  insertFeedbackAnalysisRows,
  upsertFeedbackInsightsReports,
} from 'server/express/controllers/repositories/iaAnalyze/iaAnalyzeFeedbackRepository.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IaAnalyzeFeedbackInput,
} from 'lib/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeRemoteRunRequest } from 'lib/interfaces/contracts/ia-analyze/remote.contract.js';
import type {
  IaAnalyzeRunRequest,
  IaAnalyzeRunResponse,
} from 'lib/interfaces/contracts/ia-analyze/run.contract.js';
import type {
  IaAnalyzeScopeType,
  IaAnalyzeSentiment,
} from 'lib/interfaces/contracts/ia-analyze/scope.contract.js';

export { IaAnalyzeServiceError };

export type SupabaseServerClient = SupabaseClient;

export type Sentiment = IaAnalyzeSentiment;

export type FeedbackForAnalysis = IaAnalyzeFeedbackInput;

export type IaAnalyzeResult = IaAnalyzeRunResponse;

export type IaAnalyzeOptions = IaAnalyzeRunRequest;

const MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS = 10;

type AnalysisBatch = {
  scopeType: IaAnalyzeScopeType;
  catalogItemId: string | null;
  catalogItemName: string | null;
  feedbacks: FeedbackForAnalysis[];
};

function normalizeScopeType(kind: string | null | undefined): IaAnalyzeScopeType {
  const normalized = String(kind ?? '').toUpperCase();

  if (normalized === 'PRODUCT') return 'PRODUCT';
  if (normalized === 'SERVICE') return 'SERVICE';
  if (normalized === 'DEPARTMENT') return 'DEPARTMENT';
  return 'COMPANY';
}

function buildEnterpriseContext(params: {
  enterpriseName: string | null;
  collecting: CollectingDataContext | null;
}) {
  const { enterpriseName, collecting } = params;

  return {
    enterprise_name: enterpriseName,
    company_objective: collecting?.company_objective ?? null,
    analytics_goal: collecting?.analytics_goal ?? null,
    business_summary: collecting?.business_summary ?? null,
    main_products_or_services: collecting?.main_products_or_services ?? null,
  };
}

function hasRequiredEnterpriseInfoForAnalysis(
  collecting: CollectingDataContext | null,
) {
  if (!collecting) {
    return false;
  }

  const hasCompanyObjective = String(collecting.company_objective ?? '').trim().length > 0;
  const hasAnalyticsGoal = String(collecting.analytics_goal ?? '').trim().length > 0;
  const hasBusinessSummary = String(collecting.business_summary ?? '').trim().length > 0;

  return hasCompanyObjective && hasAnalyticsGoal && hasBusinessSummary;
}

function applyExecutionFilter(
  feedbacks: FeedbackForAnalysis[],
  options?: IaAnalyzeOptions,
) {
  const scope = options?.scope_type;
  const catalogItemId = options?.catalog_item_id?.trim();

  if (!scope && !catalogItemId) {
    return feedbacks;
  }

  return feedbacks.filter((feedback) => {
    const feedbackScope = normalizeScopeType(feedback.scope_type);
    const feedbackCatalogItemId = feedback.catalog_item?.id ?? null;

    if (scope === 'COMPANY') {
      return feedbackScope === 'COMPANY';
    }

    if (scope && feedbackScope !== scope) {
      return false;
    }

    if (catalogItemId) {
      return feedbackCatalogItemId === catalogItemId;
    }

    if (scope) {
      return feedbackScope === scope;
    }

    return feedbackCatalogItemId !== null;
  });
}

function buildAnalysisBatches(
  feedbacks: FeedbackForAnalysis[],
  options?: IaAnalyzeOptions,
): AnalysisBatch[] {
  const scope = options?.scope_type;
  const catalogItemId = options?.catalog_item_id?.trim();

  const companyFeedbacks = feedbacks.filter((feedback) =>
    normalizeScopeType(feedback.scope_type) === 'COMPANY',
  );

  const itemBuckets = new Map<string, AnalysisBatch>();

  feedbacks.forEach((feedback) => {
    const feedbackScope = normalizeScopeType(feedback.scope_type);
    const item = feedback.catalog_item;

    if (feedbackScope === 'COMPANY' || !item?.id) {
      return;
    }

    const key = `${feedbackScope}:${item.id}`;
    const current = itemBuckets.get(key);

    if (!current) {
      itemBuckets.set(key, {
        scopeType: feedbackScope,
        catalogItemId: item.id,
        catalogItemName: item.name,
        feedbacks: [feedback],
      });
      return;
    }

    current.feedbacks.push(feedback);
  });

  const itemBatches = Array.from(itemBuckets.values());

  if (scope === 'COMPANY') {
    return companyFeedbacks.length > 0
      ? [
          {
            scopeType: 'COMPANY',
            catalogItemId: null,
            catalogItemName: null,
            feedbacks: companyFeedbacks,
          },
        ]
      : [];
  }

  if (scope) {
    const filteredByScope = itemBatches.filter((batch) => batch.scopeType === scope);

    if (catalogItemId) {
      return filteredByScope.filter((batch) => batch.catalogItemId === catalogItemId);
    }

    return filteredByScope;
  }

  if (catalogItemId) {
    return itemBatches.filter((batch) => batch.catalogItemId === catalogItemId);
  }

  const batches: AnalysisBatch[] = [];

  if (companyFeedbacks.length > 0) {
    batches.push({
      scopeType: 'COMPANY',
      catalogItemId: null,
      catalogItemName: null,
      feedbacks: companyFeedbacks,
    });
  }

  batches.push(...itemBatches);

  return batches;
}

export async function analyzeFeedbacksForEnterprise(params: {
  supabase: SupabaseServerClient;
  userId: string;
  options?: IaAnalyzeOptions;
}): Promise<IaAnalyzeResult> {
  const { supabase, userId, options } = params;

  const { enterpriseId, collecting, enterpriseName } = await fetchEnterpriseContextForAnalysis({
    supabase,
    userId,
  });

  if (!hasRequiredEnterpriseInfoForAnalysis(collecting)) {
    throw new IaAnalyzeServiceError(
      'collecting_data_required_for_analysis',
      422,
      'collecting_data_required_for_analysis',
    );
  }

  const limit =
    typeof options?.limit === 'number' && options.limit > 0
      ? Math.min(options.limit, 100)
      : 50;

  const feedbacksForAnalysis = await fetchFeedbacksForAnalysis({
    supabase,
    enterpriseId,
    limit,
  });

  const feedbacksForExecution = applyExecutionFilter(feedbacksForAnalysis, options);

  if (feedbacksForExecution.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: null,
      contexts: [],
    };
  }

  if (feedbacksForExecution.length < MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS) {
    throw new IaAnalyzeServiceError(
      'insufficient_feedbacks_for_analysis',
      422,
      'insufficient_feedbacks_for_analysis',
    );
  }

  const alreadyAnalyzedIds = await fetchAlreadyAnalyzedFeedbackIds({
    supabase,
    feedbackIds: feedbacksForExecution.map((feedback) => feedback.id),
  });

  const feedbacksToAnalyze = feedbacksForExecution.filter(
    (feedback) => !alreadyAnalyzedIds.has(feedback.id),
  );

  if (feedbacksToAnalyze.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: null,
      contexts: [],
    };
  }

  const enterpriseContext = buildEnterpriseContext({
    enterpriseName,
    collecting,
  });

  const analysisBatches = buildAnalysisBatches(feedbacksToAnalyze, options);

  if (analysisBatches.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: null,
      contexts: [],
    };
  }

  const remotePayload: IaAnalyzeRemoteRunRequest = {
    enterprise_context: enterpriseContext,
    batches: analysisBatches.map((batch) => ({
      scope_type: batch.scopeType,
      catalog_item_id: batch.catalogItemId,
      catalog_item_name: batch.catalogItemName,
      feedbacks: batch.feedbacks,
    })),
  };

  const remoteResult = await runIaAnalyzeAnalysis(remotePayload);

  const validSentiments: Sentiment[] = ['positive', 'negative', 'neutral'];
  const validSentimentsSet = new Set(validSentiments);
  const allowedFeedbackIds = new Set(feedbacksToAnalyze.map((feedback) => feedback.id));

  const rowsByFeedbackId = new Map<
    string,
    {
      feedback_id: string;
      sentiment: Sentiment;
      categories: string[];
      keywords: string[];
    }
  >();

  remoteResult.analyses.forEach((item) => {
    if (
      typeof item.feedback_id !== 'string' ||
      !validSentimentsSet.has(item.sentiment) ||
      !allowedFeedbackIds.has(item.feedback_id)
    ) {
      return;
    }

    rowsByFeedbackId.set(item.feedback_id, {
      feedback_id: item.feedback_id,
      sentiment: item.sentiment,
      categories: Array.isArray(item.categories) ? item.categories : [],
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
    });
  });

  const rowsToInsert = Array.from(rowsByFeedbackId.values());
  const insightsContexts = remoteResult.contexts;

  const globalInsights =
    insightsContexts.find(
      (context) =>
        context.scope_type === 'COMPANY' &&
        context.catalog_item_id === null &&
        context.globalInsights,
    )?.globalInsights ?? insightsContexts[0]?.globalInsights ?? null;

  if (rowsToInsert.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights,
      contexts: insightsContexts,
    };
  }

  const feedbacksAnalyzed = await insertFeedbackAnalysisRows({
    supabase,
    rows: rowsToInsert,
  });

  await upsertFeedbackInsightsReports({
    supabase,
    enterpriseId,
    contexts: insightsContexts,
  });

  return {
    analyzedCount: rowsToInsert.length,
    feedbacksAnalyzed,
    globalInsights,
    contexts: insightsContexts,
  };
}
