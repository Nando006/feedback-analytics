import { GoogleGenAI } from '@google/genai';
import { createSupabaseServerClient } from '../supabase.js';
import {
  buildIaPromptByScope,
  type FeedbackScopeType,
  type PromptEnterpriseContext,
  type PromptFeedbackInput,
} from './iaStudioPromptBuilders.js';

export type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export type Sentiment = 'positive' | 'negative' | 'neutral';

export type FeedbackForAnalysis = PromptFeedbackInput;

export type IaFeedbackAnalysisItem = {
  feedback_id: string;
  sentiment: Sentiment;
  categories: string[];
  keywords: string[];
};

export type IaGlobalInsights = {
  summary?: string;
  recommendations?: string[];
};

export type IaStudioResult = {
  analyzedCount: number;
  feedbacksAnalyzed: {
    id: string;
    feedback_id: string;
    sentiment: Sentiment;
    categories: string[];
    keywords: string[];
  }[];
  globalInsights: IaGlobalInsights | null;
  contexts: Array<{
    scope_type: FeedbackScopeType;
    catalog_item_id: string | null;
    catalog_item_name: string | null;
    analyzedCount: number;
    globalInsights: IaGlobalInsights | null;
  }>;
};

type IaStudioResultContext = IaStudioResult['contexts'][number];

export type IaStudioOptions = {
  /**
   * Quantidade máxima de feedbacks a serem enviados para a IA.
   * Default: 50, Máximo: 100.
   */
  limit?: number;
  scope_type?: FeedbackScopeType;
  catalog_item_id?: string;
};

const MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS = 10;

type AnalysisBatch = {
  scopeType: FeedbackScopeType;
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

export class IaStudioServiceError extends Error {
  public statusCode: number;

  public code: string;

  constructor(
    message: string,
    statusCode: number,
    code: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function extractJsonFromText(raw: string): string {
  let text = raw.trim();

  // Remove cercas de código ```json ... ``` ou ``` ... ``` se existirem
  if (text.startsWith('```')) {
    const firstLineEnd = text.indexOf('\n');
    if (firstLineEnd !== -1) {
      // Ignora a linha inicial ``` ou ```json
      text = text.slice(firstLineEnd + 1);
      const lastFenceIndex = text.lastIndexOf('```');
      if (lastFenceIndex !== -1) {
        text = text.slice(0, lastFenceIndex);
      }
      text = text.trim();
    }
  }

  // Se ainda tiver texto extra, tenta pegar apenas o primeiro bloco JSON
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text;
}

function normalizeScopeType(kind: string | null | undefined): FeedbackScopeType {
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
}): PromptEnterpriseContext {
  const { enterpriseName, collecting } = params;

  return {
    enterprise_name: enterpriseName,
    company_objective: collecting?.company_objective ?? null,
    analytics_goal: collecting?.analytics_goal ?? null,
    business_summary: collecting?.business_summary ?? null,
    main_products_or_services: collecting?.main_products_or_services ?? null,
  };
}

function applyExecutionFilter(
  feedbacks: FeedbackForAnalysis[],
  options?: IaStudioOptions,
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
  options?: IaStudioOptions,
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
    throw new IaStudioServiceError(
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
      throw new IaStudioServiceError(
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

  if (feedbackIds.length > 0) {
    const { data: answerRows, error: answersError } = await supabase
      .from('feedback_question_answers')
      .select(
        'feedback_id, question_id, question_text_snapshot, answer_value, answer_score, created_at',
      )
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (answersError) {
      throw new IaStudioServiceError(
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
    } satisfies FeedbackForAnalysis;
  });
}

export async function analyzeFeedbacksForEnterprise(params: {
  supabase: SupabaseServerClient;
  userId: string;
  options?: IaStudioOptions;
}): Promise<IaStudioResult> {
  const { supabase, userId, options } = params;

  // 1) Descobrir a empresa do usuário autenticado
  const { data: enterpriseRow, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', userId)
    .single();

  if (enterpriseError || !enterpriseRow) {
    throw new IaStudioServiceError(
      'Enterprise not found',
      404,
      'enterprise_not_found',
    );
  }

  const enterpriseId = enterpriseRow.id as string;

  // 2) Buscar dados de contexto da empresa (collecting_data_enterprise)
  const { data: collecting, error: collectingError } = await supabase
    .from('collecting_data_enterprise')
    .select(
      'company_objective, analytics_goal, business_summary, main_products_or_services',
    )
    .eq('enterprise_id', enterpriseRow.id)
    .maybeSingle();

  if (collectingError) {
    throw new IaStudioServiceError(
      'Failed to fetch collecting data',
      500,
      'failed_to_fetch_collecting_data',
    );
  }

  // 3) Buscar nome da empresa a partir dos metadados do usuário (raw_user_meta_data.full_name)
  const { data: authData } = await supabase.auth.getUser();
  const enterpriseName =
    (authData.user?.user_metadata as { full_name?: string } | null)
      ?.full_name ?? null;

  // 4) Buscar feedbacks da empresa (limitado para evitar prompts gigantes)
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
    throw new IaStudioServiceError(
      'insufficient_feedbacks_for_analysis',
      422,
      'insufficient_feedbacks_for_analysis',
    );
  }

  // 5) Evitar reprocessar feedbacks já analisados buscando os IDs já presentes em feedback_analysis
  const { data: existingAnalysis, error: existingAnalysisError } = await supabase
    .from('feedback_analysis')
    .select('feedback_id')
    .in(
      'feedback_id',
      feedbacksForExecution.map((f) => f.id),
    );

  if (existingAnalysisError) {
    throw new IaStudioServiceError(
      'Failed to fetch existing analysis',
      500,
      'failed_to_fetch_existing_analysis',
    );
  }

  const alreadyAnalyzedIds = new Set(
    (existingAnalysis ?? []).map((row) => row.feedback_id as string),
  );

  const feedbacksToAnalyze = feedbacksForExecution.filter(
    (f) => !alreadyAnalyzedIds.has(f.id),
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new IaStudioServiceError(
      'Missing Gemini API key',
      500,
      'missing_gemini_api_key',
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const validSentiments: Sentiment[] = ['positive', 'negative', 'neutral'];
  const validSentimentsSet = new Set(validSentiments);

  const rowsByFeedbackId = new Map<
    string,
    {
      feedback_id: string;
      sentiment: Sentiment;
      categories: string[];
      keywords: string[];
    }
  >();

  const insightsContexts: IaStudioResultContext[] = [];

  for (const batch of analysisBatches) {
    const prompt = buildIaPromptByScope({
      scopeType: batch.scopeType,
      enterpriseContext,
      feedbacks: batch.feedbacks,
    });

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    type AiResponseShape = {
      text?: string | (() => string);
    };

    const maybeText = (aiResponse as AiResponseShape).text;
    const rawText =
      (typeof maybeText === 'function' ? maybeText() : maybeText) ?? '';

    let parsed:
      | {
          feedbacks?: IaFeedbackAnalysisItem[];
          global_insights?: IaGlobalInsights;
        }
      | null = null;

    try {
      const jsonString = extractJsonFromText(rawText);
      parsed = JSON.parse(jsonString) as {
        feedbacks?: IaFeedbackAnalysisItem[];
        global_insights?: IaGlobalInsights;
      };
    } catch {
      throw new IaStudioServiceError(
        'Invalid AI response JSON',
        502,
        'invalid_ai_response',
      );
    }

    insightsContexts.push({
      scope_type: batch.scopeType,
      catalog_item_id: batch.catalogItemId,
      catalog_item_name: batch.catalogItemName,
      globalInsights: parsed?.global_insights ?? null,
      analyzedCount: batch.feedbacks.length,
    });

    const items = Array.isArray(parsed?.feedbacks) ? parsed.feedbacks : [];
    const allowedFeedbackIds = new Set(batch.feedbacks.map((item) => item.id));

    items.forEach((item) => {
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
        categories: Array.isArray(item.categories)
          ? item.categories
          : ([] as string[]),
        keywords: Array.isArray(item.keywords)
          ? item.keywords
          : ([] as string[]),
      });
    });
  }

  const rowsToInsert = Array.from(rowsByFeedbackId.values());

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
    throw new IaStudioServiceError(
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
      inserted?.map((row) => ({
        id: row.id as string,
        feedback_id: row.feedback_id as string,
        sentiment: row.sentiment as Sentiment,
        categories: (row.categories ?? []) as string[],
        keywords: (row.keywords ?? []) as string[],
      })) ?? [],
    globalInsights,
    contexts: insightsContexts,
  };
}


