import { runIaAnalyzeAnalysis } from './iaAnalyzeGatewayClient.js';
import { IaAnalyzeServiceError } from './iaAnalyzeErrors.js';
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

type CollectingDataContext = {
  company_objective?: string | null;
  analytics_goal?: string | null;
  business_summary?: string | null;
  main_products_or_services?: string[] | null;
};

type RawFeedbackRow = {
  id: string;
  message: string;
  rating: number | null;
  created_at: string | null;
  collection_points:
    | {
        id?: string | null;
        name?: string | null;
        type?: string | null;
        identifier?: string | null;
        catalog_item_id?: string | null;
      }
    | Array<{
        id?: string | null;
        name?: string | null;
        type?: string | null;
        identifier?: string | null;
        catalog_item_id?: string | null;
      }>
    | null;
};

type RawCatalogItemRow = {
  id: string;
  name: string;
  kind: string;
  description: string | null;
};

type RawFeedbackQuestionAnswerRow = {
  feedback_id: string;
  question_id: string;
  question_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
};

type RawFeedbackSubquestionAnswerRow = {
  feedback_id: string;
  subquestion_id: string;
  subquestion_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
};

function normalizeScopeType(kind: string | null | undefined): IaAnalyzeScopeType {
  const normalized = String(kind ?? '').toUpperCase();

  if (normalized === 'PRODUCT') return 'PRODUCT';
  if (normalized === 'SERVICE') return 'SERVICE';
  if (normalized === 'DEPARTMENT') return 'DEPARTMENT';
  return 'COMPANY';
}

function resolveCollectionPoint(
  collectionPointRaw: RawFeedbackRow['collection_points'],
) {
  if (Array.isArray(collectionPointRaw)) {
    return collectionPointRaw[0] ?? null;
  }

  return collectionPointRaw ?? null;
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

async function fetchFeedbacksForAnalysis(params: {
  supabase: SupabaseServerClient;
  enterpriseId: string;
  limit: number;
}) {
  const { supabase, enterpriseId, limit } = params;

  const { data: feedbacks, error: feedbackError } = await supabase
    .from('feedback')
    .select(
      `
      id,
      message,
      rating,
      created_at,
      collection_points(
        id,
        name,
        type,
        identifier,
        catalog_item_id
      )
    `,
    )
    .eq('enterprise_id', enterpriseId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (feedbackError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch feedbacks for IA',
      500,
      'failed_to_fetch_feedbacks_for_ia',
    );
  }

  const feedbackRows = (feedbacks ?? []) as RawFeedbackRow[];

  const catalogItemIds = Array.from(
    new Set(
      feedbackRows
        .map((feedback) => resolveCollectionPoint(feedback.collection_points)?.catalog_item_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

  let catalogItemById = new Map<
    string,
    {
      id: string;
      name: string;
      kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
      description: string | null;
    }
  >();

  if (catalogItemIds.length > 0) {
    const { data: catalogRows, error: catalogError } = await supabase
      .from('catalog_items')
      .select('id, name, kind, description')
      .in('id', catalogItemIds);

    if (catalogError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch catalog items for IA',
        500,
        'failed_to_fetch_catalog_items_for_ia',
      );
    }

    catalogItemById = new Map(
      ((catalogRows ?? []) as RawCatalogItemRow[])
        .map((row) => {
          const scopeType = normalizeScopeType(row.kind);
          if (scopeType === 'COMPANY') return null;

          return [
            row.id,
            {
              id: row.id,
              name: row.name,
              kind: scopeType,
              description: row.description ?? null,
            },
          ] as const;
        })
        .filter(
          (
            entry,
          ): entry is readonly [
            string,
            {
              id: string;
              name: string;
              kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
              description: string | null;
            },
          ] => Boolean(entry),
        ),
    );
  }

  const feedbackIds = feedbackRows
    .map((feedback) => feedback.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const answersByFeedbackId = new Map<
    string,
    Array<{
      question_id: string;
      question_text_snapshot: string;
      answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
      answer_score: number;
    }>
  >();

  const subanswersByFeedbackId = new Map<
    string,
    Array<{
      subquestion_id: string;
      subquestion_text_snapshot: string;
      answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
      answer_score: number;
    }>
  >();

  if (feedbackIds.length > 0) {
    const { data: answerRows, error: answersError } = await supabase
      .from('feedback_question_answers')
      .select(
        'feedback_id, question_id, question_text_snapshot, answer_value, answer_score, created_at',
      )
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (answersError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch feedback dynamic answers for IA',
        500,
        'failed_to_fetch_feedback_dynamic_answers_for_ia',
      );
    }

    ((answerRows ?? []) as RawFeedbackQuestionAnswerRow[]).forEach((answer) => {
      const current = answersByFeedbackId.get(answer.feedback_id) ?? [];

      current.push({
        question_id: answer.question_id,
        question_text_snapshot: answer.question_text_snapshot,
        answer_value: answer.answer_value,
        answer_score: answer.answer_score,
      });

      answersByFeedbackId.set(answer.feedback_id, current);
    });

    const { data: subanswerRows, error: subanswersError } = await supabase
      .from('feedback_subquestion_answers')
      .select(
        'feedback_id, subquestion_id, subquestion_text_snapshot, answer_value, answer_score, created_at',
      )
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (subanswersError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch feedback dynamic subanswers for IA',
        500,
        'failed_to_fetch_feedback_dynamic_subanswers_for_ia',
      );
    }

    ((subanswerRows ?? []) as RawFeedbackSubquestionAnswerRow[]).forEach(
      (subanswer) => {
        const current = subanswersByFeedbackId.get(subanswer.feedback_id) ?? [];

        current.push({
          subquestion_id: subanswer.subquestion_id,
          subquestion_text_snapshot: subanswer.subquestion_text_snapshot,
          answer_value: subanswer.answer_value,
          answer_score: subanswer.answer_score,
        });

        subanswersByFeedbackId.set(subanswer.feedback_id, current);
      },
    );
  }

  return feedbackRows.map((feedback) => {
    const collectionPoint = resolveCollectionPoint(feedback.collection_points);

    const catalogItemId =
      typeof collectionPoint?.catalog_item_id === 'string'
        ? collectionPoint.catalog_item_id
        : null;

    const catalogItem = catalogItemId
      ? (catalogItemById.get(catalogItemId) ?? null)
      : null;

    const scopeType = normalizeScopeType(catalogItem?.kind ?? null);

    return {
      id: feedback.id,
      message: feedback.message,
      rating: feedback.rating ?? null,
      created_at: feedback.created_at ?? null,
      scope_type: scopeType,
      collection_point: {
        id: collectionPoint?.id ?? null,
        name: collectionPoint?.name ?? null,
        type: collectionPoint?.type ?? null,
        identifier: collectionPoint?.identifier ?? null,
      },
      catalog_item: catalogItem,
      dynamic_answers: answersByFeedbackId.get(feedback.id) ?? [],
      dynamic_subanswers: subanswersByFeedbackId.get(feedback.id) ?? [],
    } satisfies FeedbackForAnalysis;
  });
}

export async function analyzeFeedbacksForEnterprise(params: {
  supabase: SupabaseServerClient;
  userId: string;
  options?: IaAnalyzeOptions;
}): Promise<IaAnalyzeResult> {
  const { supabase, userId, options } = params;

  const { data: enterpriseRow, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', userId)
    .single();

  if (enterpriseError || !enterpriseRow) {
    throw new IaAnalyzeServiceError(
      'Enterprise not found',
      404,
      'enterprise_not_found',
    );
  }

  const enterpriseId = enterpriseRow.id as string;

  const { data: collecting, error: collectingError } = await supabase
    .from('collecting_data_enterprise')
    .select(
      'company_objective, analytics_goal, business_summary, main_products_or_services',
    )
    .eq('enterprise_id', enterpriseRow.id)
    .maybeSingle();

  if (collectingError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch collecting data',
      500,
      'failed_to_fetch_collecting_data',
    );
  }

  if (!hasRequiredEnterpriseInfoForAnalysis(collecting as CollectingDataContext | null)) {
    throw new IaAnalyzeServiceError(
      'collecting_data_required_for_analysis',
      422,
      'collecting_data_required_for_analysis',
    );
  }

  const { data: authData } = await supabase.auth.getUser();
  const enterpriseName =
    (authData.user?.user_metadata as { full_name?: string } | null)
      ?.full_name ?? null;

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

  const { data: existingAnalysis, error: existingAnalysisError } = await supabase
    .from('feedback_analysis')
    .select('feedback_id')
    .in(
      'feedback_id',
      feedbacksForExecution.map((feedback) => feedback.id),
    );

  if (existingAnalysisError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch existing analysis',
      500,
      'failed_to_fetch_existing_analysis',
    );
  }

  const alreadyAnalyzedIds = new Set(
    (existingAnalysis ?? [])
      .map((row: { feedback_id: string | null }) => row.feedback_id)
      .filter((feedbackId: string | null): feedbackId is string =>
        typeof feedbackId === 'string' && feedbackId.length > 0,
      ),
  );

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
    collecting: collecting as CollectingDataContext | null,
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

  const { data: inserted, error: insertError } = await supabase
    .from('feedback_analysis')
    .insert(rowsToInsert)
    .select('id, feedback_id, sentiment, categories, keywords');

  if (insertError) {
    throw new IaAnalyzeServiceError(
      'Failed to save feedback analysis',
      500,
      'failed_to_save_feedback_analysis',
    );
  }

  for (const context of insightsContexts) {
    const summary = context.globalInsights?.summary?.trim() || null;
    const recommendations =
      context.globalInsights?.recommendations?.filter((value: string) =>
        String(value ?? '').trim(),
      ) ?? [];

    const hasMeaningfulData = summary || recommendations.length > 0;

    if (!hasMeaningfulData) {
      continue;
    }

    const payload = {
      enterprise_id: enterpriseId,
      scope_type: context.scope_type,
      catalog_item_id: context.catalog_item_id,
      catalog_item_name: context.catalog_item_name,
      summary,
      recommendations,
      updated_at: new Date().toISOString(),
    };

    const { error: scopedUpsertError } = await supabase
      .from('feedback_insights_report')
      .upsert(payload, {
        onConflict: 'enterprise_id,scope_type,catalog_item_id',
      });

    if (!scopedUpsertError) {
      continue;
    }

    if (context.scope_type !== 'COMPANY' || context.catalog_item_id !== null) {
      console.error('Falha ao salvar feedback_insights_report segmentado', scopedUpsertError);
      continue;
    }

    const legacyPayload = {
      enterprise_id: enterpriseId,
      summary,
      recommendations,
      updated_at: new Date().toISOString(),
    };

    const { error: legacyUpsertError } = await supabase
      .from('feedback_insights_report')
      .upsert(legacyPayload, {
        onConflict: 'enterprise_id',
      });

    if (legacyUpsertError) {
      console.error('Falha ao salvar feedback_insights_report legado', legacyUpsertError);
    }
  }

  return {
    analyzedCount: rowsToInsert.length,
    feedbacksAnalyzed:
      inserted?.map((row: {
        id: string;
        feedback_id: string;
        sentiment: Sentiment;
        categories: string[] | null;
        keywords: string[] | null;
      }) => ({
        id: row.id,
        feedback_id: row.feedback_id,
        sentiment: row.sentiment,
        categories: row.categories ?? [],
        keywords: row.keywords ?? [],
      })) ?? [],
    globalInsights,
    contexts: insightsContexts,
  };
}
