import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IaAnalyzeAnalyzedItem,
  IaAnalyzeContext,
} from 'lib/interfaces/contracts/ia-analyze/analysis.contract.js';
import type {
  IaAnalyzeFeedbackInput,
} from 'lib/interfaces/contracts/ia-analyze/input.contract.js';
import type {
  IaAnalyzeSentiment,
  IaAnalyzeScopeType,
} from 'lib/interfaces/contracts/ia-analyze/scope.contract.js';
import { IaAnalyzeServiceError } from '../../../services/iaAnalyze/iaAnalyzeErrors.js';

type SupabaseServerClient = SupabaseClient;

type FeedbackForAnalysis = IaAnalyzeFeedbackInput;

export type CollectingDataContext = {
  company_objective?: string | null;
  analytics_goal?: string | null;
  business_summary?: string | null;
  main_products_or_services?: string[] | null;
};

type FeedbackAnalysisInsertRow = {
  feedback_id: string;
  sentiment: IaAnalyzeSentiment;
  categories: string[];
  keywords: string[];
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

export async function fetchFeedbacksForAnalysis(params: {
  supabase: SupabaseServerClient;
  enterpriseId: string;
  limit: number;
}): Promise<FeedbackForAnalysis[]> {
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

export async function fetchEnterpriseContextForAnalysis(params: {
  supabase: SupabaseServerClient;
  userId: string;
}): Promise<{
  enterpriseId: string;
  collecting: CollectingDataContext | null;
  enterpriseName: string | null;
}> {
  const { supabase, userId } = params;

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
    .eq('enterprise_id', enterpriseId)
    .maybeSingle();

  if (collectingError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch collecting data',
      500,
      'failed_to_fetch_collecting_data',
    );
  }

  const { data: authData } = await supabase.auth.getUser();
  const enterpriseName =
    (authData.user?.user_metadata as { full_name?: string } | null)
      ?.full_name ?? null;

  return {
    enterpriseId,
    collecting: (collecting as CollectingDataContext | null) ?? null,
    enterpriseName,
  };
}

export async function fetchAlreadyAnalyzedFeedbackIds(params: {
  supabase: SupabaseServerClient;
  feedbackIds: string[];
}): Promise<Set<string>> {
  const { supabase, feedbackIds } = params;

  if (feedbackIds.length === 0) {
    return new Set<string>();
  }

  const { data: existingAnalysis, error: existingAnalysisError } = await supabase
    .from('feedback_analysis')
    .select('feedback_id')
    .in('feedback_id', feedbackIds);

  if (existingAnalysisError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch existing analysis',
      500,
      'failed_to_fetch_existing_analysis',
    );
  }

  return new Set(
    (existingAnalysis ?? [])
      .map((row: { feedback_id: string | null }) => row.feedback_id)
      .filter((feedbackId: string | null): feedbackId is string =>
        typeof feedbackId === 'string' && feedbackId.length > 0,
      ),
  );
}

export async function insertFeedbackAnalysisRows(params: {
  supabase: SupabaseServerClient;
  rows: FeedbackAnalysisInsertRow[];
}): Promise<IaAnalyzeAnalyzedItem[]> {
  const { supabase, rows } = params;

  if (rows.length === 0) {
    return [];
  }

  const { data: inserted, error: insertError } = await supabase
    .from('feedback_analysis')
    .insert(rows)
    .select('id, feedback_id, sentiment, categories, keywords');

  if (insertError) {
    throw new IaAnalyzeServiceError(
      'Failed to save feedback analysis',
      500,
      'failed_to_save_feedback_analysis',
    );
  }

  return (
    inserted?.map((row: {
      id: string;
      feedback_id: string;
      sentiment: IaAnalyzeSentiment;
      categories: string[] | null;
      keywords: string[] | null;
    }) => ({
      id: row.id,
      feedback_id: row.feedback_id,
      sentiment: row.sentiment,
      categories: row.categories ?? [],
      keywords: row.keywords ?? [],
    })) ?? []
  );
}

export async function upsertFeedbackInsightsReports(params: {
  supabase: SupabaseServerClient;
  enterpriseId: string;
  contexts: IaAnalyzeContext[];
}): Promise<void> {
  const { supabase, enterpriseId, contexts } = params;

  for (const context of contexts) {
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
}

