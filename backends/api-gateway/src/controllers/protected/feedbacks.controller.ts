import type { Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_FAILED_TO_COUNT_FEEDBACKS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACKS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACK_INSIGHTS_REPORT,
  API_ERROR_FAILED_TO_FETCH_STATS,
  API_ERROR_INTERNAL_SERVER_ERROR,
} from '../../config/errors.js';
import { normalizeFeedbackAnalysisRows } from '../../libs/iaAnalyze/normalize.js';
import { sendTypedError } from '../../utils/sendTypedError.js';
import {
  ratingStats,
  csatTopTwoBox,
  netSatisfaction,
  netSentimentScore,
  confidenceTier,
  wilsonInterval,
  wilsonLowerBound,
} from '../../libs/statistics/index.js';

type FeedbackQuestionAnswerRow = {
  feedback_id: string;
  question_id: string;
  question_text_snapshot: string;
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
  created_at: string;
};

type FeedbackCollectionPoint = {
  id?: string;
  name?: string;
  type?: string;
  identifier?: string | null;
  catalog_item_id?: string | null;
};

type IdRow = { id: string };

type CatalogItemRow = {
  id: string;
  name: string;
  kind: string | null;
};

type FeedbackStatsRow = { id: string; rating: number };

type FeedbackListRow = {
  id: string;
  collection_points: FeedbackCollectionPoint | FeedbackCollectionPoint[] | null;
} & Record<string, unknown>;

function resolveCollectionPoint(
  collectionPointRaw: FeedbackCollectionPoint | FeedbackCollectionPoint[] | null | undefined,
) {
  if (Array.isArray(collectionPointRaw)) return collectionPointRaw[0] ?? null;
  return collectionPointRaw ?? null;
}

function parseInsightScopeType(rawValue: unknown) {
  const normalized = String(rawValue ?? '').trim().toUpperCase();
  if (
    normalized === 'COMPANY' ||
    normalized === 'PRODUCT' ||
    normalized === 'SERVICE' ||
    normalized === 'DEPARTMENT'
  ) {
    return normalized;
  }
  return undefined;
}

type InsightScopeType = 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

/**
 * Resolve o escopo selecionado (header) para a lista de `collection_point` ids
 * que as métricas/análises devem considerar.
 *
 * Retorno:
 *  - `{ ids: null }`     => sem filtro de escopo (todos os feedbacks da empresa)
 *  - `{ ids: string[] }` => filtrar `feedback` por esses ids (`[]` => nenhum resultado)
 *  - `{ error: true }`   => falha de query (o chamador escolhe o código de erro)
 *
 * COMPANY (Geral) => apenas o ponto de coleta da empresa (`catalog_item_id IS NULL`).
 * Compartilhado por stats e analysis para manter o mesmo critério de escopo.
 */
async function resolveScopeCollectionPointIds(params: {
  supabase: SupabaseClient;
  enterpriseId: string;
  scopeType: InsightScopeType | undefined;
  catalogItemId: string | null;
}): Promise<{ error: true } | { error: false; ids: string[] | null }> {
  const { supabase, enterpriseId, scopeType, catalogItemId } = params;

  if (!scopeType && !catalogItemId) {
    return { error: false, ids: null };
  }

  if (scopeType === 'COMPANY') {
    if (catalogItemId) {
      return { error: false, ids: [] };
    }

    const { data: companyPoints, error: companyCpError } = await supabase
      .from('collection_points')
      .select('id')
      .eq('enterprise_id', enterpriseId)
      .is('catalog_item_id', null);

    if (companyCpError) return { error: true };
    return { error: false, ids: ((companyPoints ?? []) as IdRow[]).map((cp) => cp.id) };
  }

  if (catalogItemId) {
    if (scopeType) {
      const { data: catalogItem, error: catalogItemError } = await supabase
        .from('catalog_items')
        .select('id')
        .eq('enterprise_id', enterpriseId)
        .eq('id', catalogItemId)
        .eq('kind', scopeType)
        .maybeSingle();

      if (catalogItemError) return { error: true };
      if (!catalogItem) return { error: false, ids: [] };
    }

    const { data: points, error: pointsError } = await supabase
      .from('collection_points')
      .select('id')
      .eq('enterprise_id', enterpriseId)
      .eq('catalog_item_id', catalogItemId);

    if (pointsError) return { error: true };
    return { error: false, ids: ((points ?? []) as IdRow[]).map((cp) => cp.id) };
  }

  // scopeType sem catalogItemId (ex.: todos os itens de um kind).
  const { data: catalogItems, error: catalogItemsError } = await supabase
    .from('catalog_items')
    .select('id')
    .eq('enterprise_id', enterpriseId)
    .eq('kind', scopeType);

  if (catalogItemsError) return { error: true };

  const catalogIds = ((catalogItems ?? []) as IdRow[]).map((item) => item.id);

  if (catalogIds.length === 0) {
    return { error: false, ids: [] };
  }

  const { data: points, error: pointsError } = await supabase
    .from('collection_points')
    .select('id')
    .eq('enterprise_id', enterpriseId)
    .in('catalog_item_id', catalogIds);

  if (pointsError) return { error: true };
  return { error: false, ids: ((points ?? []) as IdRow[]).map((cp) => cp.id) };
}

export async function getFeedbacksController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  const rating = req.query.rating ? parseInt(req.query.rating as string) : null;
  const search = (req.query.search as string) || '';
  const item = String(req.query.item ?? '').trim();
  const categoryRaw = String(req.query.category ?? '').trim().toUpperCase();

  const category =
    categoryRaw === 'COMPANY' ||
    categoryRaw === 'PRODUCT' ||
    categoryRaw === 'SERVICE' ||
    categoryRaw === 'DEPARTMENT'
      ? categoryRaw
      : null;

  try {
    const { data: enterprise, error: enterpriseError } = await supabase
      .from('enterprise')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (enterpriseError || !enterprise) {
      return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
    }

    let filteredCollectionPointIds: string[] | null = null;

    if (category || item) {
      if (category === 'COMPANY') {
        if (item) {
          filteredCollectionPointIds = [];
        } else {
          const { data: companyCollectionPoints, error: companyCpError } = await supabase
            .from('collection_points')
            .select('id')
            .eq('enterprise_id', enterprise.id)
            .is('catalog_item_id', null);

          if (companyCpError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);

          filteredCollectionPointIds = ((companyCollectionPoints ?? []) as IdRow[]).map((cp) => cp.id);
        }
      } else {
        let catalogQuery = supabase
          .from('catalog_items')
          .select('id')
          .eq('enterprise_id', enterprise.id);

        if (category) catalogQuery = catalogQuery.eq('kind', category);
        if (item) catalogQuery = catalogQuery.ilike('name', `%${item}%`);

        const { data: catalogItems, error: catalogItemsError } = await catalogQuery;
        if (catalogItemsError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);

        const catalogItemIds = ((catalogItems ?? []) as IdRow[]).map((ci) => ci.id);

        if (catalogItemIds.length === 0) {
          filteredCollectionPointIds = [];
        } else {
          const { data: catalogCollectionPoints, error: catalogCpError } = await supabase
            .from('collection_points')
            .select('id')
            .eq('enterprise_id', enterprise.id)
            .in('catalog_item_id', catalogItemIds);

          if (catalogCpError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);

          filteredCollectionPointIds = ((catalogCollectionPoints ?? []) as IdRow[]).map((cp) => cp.id);
        }
      }
    }

    if (filteredCollectionPointIds && filteredCollectionPointIds.length === 0) {
      return res.json({
        feedbacks: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        },
      });
    }

    let query = supabase
      .from('feedback')
      .select(
        `
        id,
        message,
        rating,
        created_at,
        updated_at,
        collection_points!inner(
          id,
          name,
          type,
          identifier,
          catalog_item_id
        ),
        tracked_devices(
          id,
          device_fingerprint,
          user_agent,
          ip_address,
          feedback_count,
          is_blocked,
          customer_id,
          customer(
            id,
            name,
            email,
            gender
          )
        )
      `,
      )
      .eq('enterprise_id', enterprise.id)
      .order('created_at', { ascending: false });

    if (rating) query = query.eq('rating', rating);
    if (search) query = query.ilike('message', `%${search}%`);
    if (filteredCollectionPointIds) query = query.in('collection_point_id', filteredCollectionPointIds);

    let countQuery = supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('enterprise_id', enterprise.id);

    if (rating) countQuery = countQuery.eq('rating', rating);
    if (search) countQuery = countQuery.ilike('message', `%${search}%`);
    if (filteredCollectionPointIds) countQuery = countQuery.in('collection_point_id', filteredCollectionPointIds);

    const { count, error: countError } = await countQuery;
    if (countError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_COUNT_FEEDBACKS);

    const { data: feedbacks, error: feedbacksError } = await query.range(offset, offset + limit - 1);
    if (feedbacksError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);

    const totalPages = Math.ceil((count || 0) / limit);
    const feedbackRows = (feedbacks ?? []) as FeedbackListRow[];

    const catalogItemIds = Array.from(
      new Set(
        feedbackRows
          .map((feedback) => resolveCollectionPoint(feedback.collection_points)?.catalog_item_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    );

    let catalogItemById = new Map<string, { name: string; kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' }>();

    if (catalogItemIds.length > 0) {
      const { data: catalogRows, error: catalogRowsError } = await supabase
        .from('catalog_items')
        .select('id, name, kind')
        .in('id', catalogItemIds);

      if (catalogRowsError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);

      catalogItemById = new Map(
        ((catalogRows ?? []) as CatalogItemRow[])
          .map((row) => {
            const normalizedKind = String(row.kind ?? '').toUpperCase();
            const kind =
              normalizedKind === 'PRODUCT' ||
              normalizedKind === 'SERVICE' ||
              normalizedKind === 'DEPARTMENT'
                ? normalizedKind
                : null;
            if (!kind || typeof row.id !== 'string') return null;
            return [row.id, { name: row.name, kind }] as const;
          })
          .filter((entry): entry is readonly [string, { name: string; kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' }] => Boolean(entry)),
      );
    }

    const normalizedFeedbacks = feedbackRows.map((feedback) => {
      const collectionPoint = resolveCollectionPoint(feedback.collection_points);
      if (!collectionPoint) return feedback;

      const catalogItem = collectionPoint.catalog_item_id
        ? (catalogItemById.get(collectionPoint.catalog_item_id) ?? null)
        : null;

      return {
        ...feedback,
        collection_points: {
          ...collectionPoint,
          catalog_item_name: catalogItem?.name ?? null,
          catalog_item_kind: catalogItem?.kind ?? null,
          catalog_items: catalogItem,
        },
      };
    });

    const feedbackIds = normalizedFeedbacks
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
        .select('feedback_id, question_id, question_text_snapshot, answer_value, answer_score, created_at')
        .in('feedback_id', feedbackIds)
        .order('created_at', { ascending: true });

      if (answersError) {
        console.error('Erro ao buscar respostas dinâmicas dos feedbacks:', answersError);
      } else {
        (answerRows as FeedbackQuestionAnswerRow[] | null)?.forEach((row) => {
          const current = answersByFeedbackId.get(row.feedback_id) ?? [];
          current.push({
            question_id: row.question_id,
            question_text_snapshot: row.question_text_snapshot,
            answer_value: row.answer_value,
            answer_score: row.answer_score,
          });
          answersByFeedbackId.set(row.feedback_id, current);
        });
      }
    }

    const normalizedFeedbacksWithAnswers = normalizedFeedbacks.map((feedback) => ({
      ...feedback,
      feedback_question_answers: answersByFeedbackId.get(feedback.id) ?? [],
    }));

    return res.json({
      feedbacks: normalizedFeedbacksWithAnswers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}

export async function getFeedbacksStatsController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const scopeType = parseInsightScopeType(req.query.scope_type);
  const catalogItemId = String(req.query.catalog_item_id ?? '').trim() || null;

  try {
    const { data: enterprise, error: enterpriseError } = await supabase
      .from('enterprise')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (enterpriseError || !enterprise) {
      return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
    }

    // Métricas filtradas pelo escopo selecionado no header (Geral = só o QR da empresa).
    const scopeResolution = await resolveScopeCollectionPointIds({
      supabase,
      enterpriseId: enterprise.id,
      scopeType,
      catalogItemId,
    });

    if (scopeResolution.error) {
      return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);
    }

    const filteredCollectionPointIds = scopeResolution.ids;

    let statsQuery = supabase
      .from('feedback')
      .select('id, rating')
      .eq('enterprise_id', enterprise.id);

    if (filteredCollectionPointIds) {
      statsQuery = statsQuery.in('collection_point_id', filteredCollectionPointIds);
    }

    const { data: stats, error: statsError } = await statsQuery;

    if (statsError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);

    const statsRows = (stats ?? []) as FeedbackStatsRow[];
    const totalFeedbacks = statsRows.length;
    const averageRating =
      totalFeedbacks > 0 ? statsRows.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks : 0;

    const ratingDistribution = {
      1: statsRows.filter((f) => f.rating === 1).length,
      2: statsRows.filter((f) => f.rating === 2).length,
      3: statsRows.filter((f) => f.rating === 3).length,
      4: statsRows.filter((f) => f.rating === 4).length,
      5: statsRows.filter((f) => f.rating === 5).length,
    };

    // Quantos desses feedbacks (no mesmo escopo) já têm análise da IA, quando foi
    // a análise mais recente (trava o "Gerar insights") e a distribuição de
    // sentimento da IA (lente "texto") sobre o subconjunto analisado.
    let totalAnalyzed = 0;
    let latestAnalysisAt: string | null = null;
    const aiCounts = { positive: 0, neutral: 0, negative: 0 };
    if (totalFeedbacks > 0) {
      const feedbackIds = statsRows.map((f) => f.id);
      const { data: analysisRows, error: analysisError } = await supabase
        .from('feedback_analysis')
        .select('feedback_id, created_at, sentiment')
        .in('feedback_id', feedbackIds);

      if (analysisError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);

      const rows = (analysisRows ?? []) as {
        feedback_id: string;
        created_at: string;
        sentiment: 'positive' | 'neutral' | 'negative';
      }[];
      totalAnalyzed = new Set(rows.map((r) => r.feedback_id)).size;
      for (const r of rows) {
        if (r.created_at && (latestAnalysisAt === null || r.created_at > latestAnalysisAt)) {
          latestAnalysisAt = r.created_at;
        }
        if (r.sentiment === 'positive' || r.sentiment === 'neutral' || r.sentiment === 'negative') {
          aiCounts[r.sentiment]++;
        }
      }
    }

    const pendingCount = totalFeedbacks - totalAnalyzed;

    // Lente SATISFAÇÃO (estrelas): média+IC t, Net Satisfaction e CSAT Top-2-Box.
    const satisfaction = ratingStats(ratingDistribution);
    const top2 = ratingDistribution[4] + ratingDistribution[5];
    const bottom2 = ratingDistribution[1] + ratingDistribution[2];

    return res.json({
      totalFeedbacks,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      // Distribuição por estrela (lente satisfação; mantida por compatibilidade).
      sentimentBreakdown: {
        positive: ratingDistribution[4] + ratingDistribution[5],
        neutral: ratingDistribution[3],
        negative: ratingDistribution[1] + ratingDistribution[2],
      },
      totalAnalyzed,
      pendingCount,
      latestAnalysisAt,
      // Lente SATISFAÇÃO (estrelas)
      starMean: satisfaction.mean,
      starMeanCI: satisfaction.ci,
      netSatisfaction: netSatisfaction(top2, bottom2, totalFeedbacks),
      csat: csatTopTwoBox(ratingDistribution),
      confidenceTier: confidenceTier(totalFeedbacks),
      // Lente SENTIMENTO (IA/texto) sobre o subconjunto analisado
      aiSentiment:
        totalAnalyzed > 0
          ? {
              positive: aiCounts.positive,
              neutral: aiCounts.neutral,
              negative: aiCounts.negative,
              netSentimentScore: netSentimentScore(aiCounts.positive, aiCounts.negative, totalAnalyzed),
              confidenceTier: confidenceTier(totalAnalyzed),
            }
          : undefined,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}

export async function getFeedbacksInsightsReportController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;
  const scopeType = parseInsightScopeType(req.query.scope_type) ?? 'COMPANY';
  const catalogItemId = String(req.query.catalog_item_id ?? '').trim() || null;

  try {
    const { data: enterprise, error: enterpriseError } = await supabase
      .from('enterprise')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (enterpriseError || !enterprise) {
      return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
    }

    let scopedQuery = supabase
      .from('feedback_insights_report')
      .select('summary, recommendations, updated_at, scope_type, catalog_item_id')
      .eq('enterprise_id', enterprise.id)
      .eq('scope_type', scopeType)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (catalogItemId) {
      scopedQuery = scopedQuery.eq('catalog_item_id', catalogItemId);
    } else if (scopeType === 'COMPANY') {
      scopedQuery = scopedQuery.is('catalog_item_id', null);
    }

    const { data: scopedRows, error: scopedError } = await scopedQuery;

    if (!scopedError) {
      const report = Array.isArray(scopedRows) ? scopedRows[0] : null;

      if (!report) {
        return res.json({ summary: null, recommendations: [], updatedAt: null, scopeType, catalogItemId });
      }

      return res.json({
        summary: (report.summary as string | null) ?? null,
        recommendations: ((report.recommendations ?? []) as string[]).filter((rec) => !!rec && rec.trim().length > 0),
        updatedAt: (report.updated_at as string | null) ?? null,
        scopeType: (report.scope_type as string | null) ?? scopeType,
        catalogItemId: (report.catalog_item_id as string | null) ?? catalogItemId,
      });
    }

    if (scopeType !== 'COMPANY' || catalogItemId) {
      return res.json({ summary: null, recommendations: [], updatedAt: null, scopeType, catalogItemId });
    }

    const { data: legacyReport, error: legacyError } = await supabase
      .from('feedback_insights_report')
      .select('summary, recommendations, updated_at')
      .eq('enterprise_id', enterprise.id)
      .maybeSingle();

    if (legacyError) {
      console.error('Erro ao buscar feedback_insights_report:', legacyError);
      return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_INSIGHTS_REPORT);
    }

    if (!legacyReport) {
      return res.json({ summary: null, recommendations: [], updatedAt: null, scopeType, catalogItemId });
    }

    return res.json({
      summary: (legacyReport.summary as string | null) ?? null,
      recommendations: ((legacyReport.recommendations ?? []) as string[]).filter((rec) => !!rec && rec.trim().length > 0),
      updatedAt: (legacyReport.updated_at as string | null) ?? null,
      scopeType,
      catalogItemId,
    });
  } catch (error) {
    console.error('Erro ao buscar relatório de insights (IA):', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}

export async function getFeedbacksAnalysisController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const sentimentFilter = (req.query.sentiment as 'positive' | 'neutral' | 'negative' | undefined) ?? undefined;
  const scopeType = parseInsightScopeType(req.query.scope_type);
  const catalogItemId = String(req.query.catalog_item_id ?? '').trim() || null;

  try {
    const { data: enterprise, error: enterpriseError } = await supabase
      .from('enterprise')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (enterpriseError || !enterprise) {
      return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
    }

    const emptyResult = {
      items: [],
      summary: { totalAnalyzed: 0, sentiments: { positive: 0, neutral: 0, negative: 0 }, topCategories: [], topKeywords: [] },
    };

    const scopeResolution = await resolveScopeCollectionPointIds({
      supabase,
      enterpriseId: enterprise.id,
      scopeType,
      catalogItemId,
    });

    if (scopeResolution.error) {
      return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS);
    }

    const filteredCollectionPointIds = scopeResolution.ids;

    if (filteredCollectionPointIds && filteredCollectionPointIds.length === 0) {
      return res.json(emptyResult);
    }

    let query = supabase
      .from('feedback')
      .select(
        `
        id,
        message,
        rating,
        created_at,
        feedback_analysis:feedback_analysis (
          sentiment,
          categories,
          keywords,
          aspects,
          sentiment_score,
          confidence
        )
      `,
      )
      .eq('enterprise_id', enterprise.id);

    if (filteredCollectionPointIds) query = query.in('collection_point_id', filteredCollectionPointIds);
    if (sentimentFilter) query = query.eq('feedback_analysis.sentiment', sentimentFilter);

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao buscar análises de feedbacks:', error);
      return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS);
    }

    const itemsRaw = normalizeFeedbackAnalysisRows(data);
    if (itemsRaw.length === 0) return res.json(emptyResult);

    const items = itemsRaw.map((row) => {
      const sentiment = row.feedback_analysis.sentiment;
      const rating = row.rating;
      const starBucket =
        rating == null ? null : rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
      const discrepancy: 'silent_detractor' | 'rating_misuse' | null =
        starBucket === 'positive' && sentiment === 'negative'
          ? 'silent_detractor'
          : starBucket === 'negative' && sentiment === 'positive'
            ? 'rating_misuse'
            : null;
      return {
        id: row.id,
        message: row.message,
        rating,
        created_at: row.created_at,
        sentiment,
        categories: row.feedback_analysis.categories ?? [],
        keywords: row.feedback_analysis.keywords ?? [],
        discrepancy,
        aspects: Array.isArray(row.feedback_analysis.aspects) ? row.feedback_analysis.aspects : [],
        sentiment_score: row.feedback_analysis.sentiment_score ?? null,
        confidence: row.feedback_analysis.confidence ?? null,
      };
    });

    const sentiments = { positive: 0, neutral: 0, negative: 0 };
    const categoryCounts: Record<string, number> = {};
    const keywordCounts: Record<string, number> = {};
    type AspectBucket = { positive: number; neutral: number; negative: number };
    const aspectCounts: Record<string, AspectBucket> = {};

    for (const item of items) {
      sentiments[item.sentiment]++;
      for (const category of item.categories) {
        const key = category.trim().toLowerCase();
        if (key) categoryCounts[key] = (categoryCounts[key] ?? 0) + 1;
      }
      for (const keyword of item.keywords) {
        const key = keyword.trim().toLowerCase();
        if (key) keywordCounts[key] = (keywordCounts[key] ?? 0) + 1;
      }
      for (const aspect of item.aspects) {
        const key = aspect.aspect.trim().toLowerCase();
        if (!key) continue;
        const bucket = (aspectCounts[key] ??= { positive: 0, neutral: 0, negative: 0 });
        bucket[aspect.sentiment]++;
      }
    }

    const totalAnalyzed = items.length;

    // Ranqueia termos pelo limite inferior de Wilson (justo p/ amostra pequena),
    // mantendo a contagem crua e anexando proporção + IC.
    const rankTerms = (counts: Record<string, number>) =>
      Object.entries(counts)
        .map(([name, count]) => ({
          name,
          count,
          proportion: totalAnalyzed > 0 ? count / totalAnalyzed : 0,
          ci: wilsonInterval(count, totalAnalyzed),
        }))
        .sort(
          (a, b) =>
            wilsonLowerBound(b.count, totalAnalyzed) - wilsonLowerBound(a.count, totalAnalyzed) ||
            b.count - a.count,
        )
        .slice(0, 10);

    // Aspectos (ABSA) agregados, ranqueados por IMPACTO (volume × |NSS|), com
    // gate de menção mínima para não destacar aspecto de amostra ínfima.
    const MIN_ASPECT_MENTIONS = 3;
    const aspectSentiments = Object.entries(aspectCounts)
      .map(([aspect, bucket]) => {
        const count = bucket.positive + bucket.neutral + bucket.negative;
        return {
          aspect,
          positive: bucket.positive,
          neutral: bucket.neutral,
          negative: bucket.negative,
          count,
          netSentimentScore: netSentimentScore(bucket.positive, bucket.negative, count),
          ci: wilsonInterval(bucket.positive, count),
        };
      })
      .filter((a) => a.count >= MIN_ASPECT_MENTIONS)
      .sort(
        (a, b) =>
          b.count * Math.abs(b.netSentimentScore) - a.count * Math.abs(a.netSentimentScore),
      )
      .slice(0, 12);

    return res.json({
      items,
      summary: {
        totalAnalyzed,
        sentiments,
        topCategories: rankTerms(categoryCounts),
        topKeywords: rankTerms(keywordCounts),
        netSentimentScore: netSentimentScore(sentiments.positive, sentiments.negative, totalAnalyzed),
        sentimentCIs: {
          positive: wilsonInterval(sentiments.positive, totalAnalyzed),
          neutral: wilsonInterval(sentiments.neutral, totalAnalyzed),
          negative: wilsonInterval(sentiments.negative, totalAnalyzed),
        },
        confidenceTier: confidenceTier(totalAnalyzed),
        aspectSentiments,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar análises de feedbacks (IA):', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}
