import type { Request, Response } from 'express';
import {
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_FAILED_TO_COUNT_FEEDBACKS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACKS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACK_INSIGHTS_REPORT,
  API_ERROR_FAILED_TO_FETCH_STATS,
  API_ERROR_INTERNAL_SERVER_ERROR,
  API_ERROR_INVALID_PAYLOAD,
} from '../../config/errors.js';
import { normalizeFeedbackAnalysisRows } from '../../libs/iaAnalyze/normalize.js';
import { resolveScopeCollectionPointIds } from '../../repositories/scope.repository.js';
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
import {
  fetchScopedRatingAggregates,
  fetchScopedAnalysisAggregates,
} from '../../repositories/feedbackStats.repository.js';

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

export async function computeFeedbackStats({
  enterpriseId,
  collectionPointIds,
  startDate,
  endDate,
}: {
  enterpriseId: string;
  collectionPointIds: string[] | null;
  startDate: string | null;
  endDate: string | null;
}) {
  const ratingAgg = await fetchScopedRatingAggregates({
    enterpriseId,
    collectionPointIds,
    startDate,
    endDate,
  });
  const analysisAgg = await fetchScopedAnalysisAggregates({
    enterpriseId,
    collectionPointIds,
    startDate,
    endDate,
  });

  const totalFeedbacks = ratingAgg.totalFeedbacks;
  const averageRating = totalFeedbacks > 0 ? ratingAgg.ratingSum / totalFeedbacks : 0;
  const ratingDistribution = ratingAgg.ratingDistribution;

  const totalAnalyzed = analysisAgg.totalAnalyzed;
  const latestAnalysisAt = analysisAgg.latestAnalysisAt;
  const aiCounts = analysisAgg.aiCounts;
  const pendingCount = totalFeedbacks - totalAnalyzed;

  const satisfaction = ratingStats(ratingDistribution);
  const top2 = ratingDistribution[4] + ratingDistribution[5];
  const bottom2 = ratingDistribution[1] + ratingDistribution[2];

  return {
    totalFeedbacks,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingDistribution,
    sentimentBreakdown: {
      positive: ratingDistribution[4] + ratingDistribution[5],
      neutral: ratingDistribution[3],
      negative: ratingDistribution[1] + ratingDistribution[2],
    },
    totalAnalyzed,
    pendingCount,
    latestAnalysisAt,
    starMean: satisfaction.mean,
    starMeanCI: satisfaction.ci,
    netSatisfaction: netSatisfaction(top2, bottom2, totalFeedbacks),
    csat: csatTopTwoBox(ratingDistribution),
    confidenceTier: confidenceTier(totalFeedbacks),
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
  };
}

export async function getFeedbacksStatsController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const scopeType = parseInsightScopeType(req.query.scope_type);
  const catalogItemId = String(req.query.catalog_item_id ?? '').trim() || null;

  const startDateRaw = req.query.start_date;
  const endDateRaw = req.query.end_date;

  let startDate: string | null = null;
  let endDate: string | null = null;

  if (startDateRaw !== undefined) {
    if (typeof startDateRaw !== 'string' || isNaN(Date.parse(startDateRaw))) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
        message: 'A data de início (start_date) fornecida é inválida. Use o formato ISO 8601.',
      });
    }
    startDate = new Date(startDateRaw).toISOString();
  }

  if (endDateRaw !== undefined) {
    if (typeof endDateRaw !== 'string' || isNaN(Date.parse(endDateRaw))) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
        message: 'A data de término (end_date) fornecida é inválida. Use o formato ISO 8601.',
      });
    }
    endDate = new Date(endDateRaw).toISOString();
  }

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

    const stats = await computeFeedbackStats({
      enterpriseId: enterprise.id,
      collectionPointIds: filteredCollectionPointIds,
      startDate,
      endDate,
    });

    return res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}

export async function getFeedbacksStatsComparisonController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const scopeType = parseInsightScopeType(req.query.scope_type);
  const catalogItemId = String(req.query.catalog_item_id ?? '').trim() || null;

  const primaryStartRaw = req.query.primary_start;
  const primaryEndRaw = req.query.primary_end;
  const referenceStartRaw = req.query.reference_start;
  const referenceEndRaw = req.query.reference_end;

  let primaryStart: string | null = null;
  let primaryEnd: string | null = null;
  let referenceStart: string | null = null;
  let referenceEnd: string | null = null;

  if (primaryStartRaw !== undefined) {
    if (typeof primaryStartRaw !== 'string' || isNaN(Date.parse(primaryStartRaw))) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
        message: 'A data primary_start fornecida é inválida. Use o formato ISO 8601.',
      });
    }
    primaryStart = new Date(primaryStartRaw).toISOString();
  }

  if (primaryEndRaw !== undefined) {
    if (typeof primaryEndRaw !== 'string' || isNaN(Date.parse(primaryEndRaw))) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
        message: 'A data primary_end fornecida é inválida. Use o formato ISO 8601.',
      });
    }
    primaryEnd = new Date(primaryEndRaw).toISOString();
  }

  if (referenceStartRaw !== undefined) {
    if (typeof referenceStartRaw !== 'string' || isNaN(Date.parse(referenceStartRaw))) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
        message: 'A data reference_start fornecida é inválida. Use o formato ISO 8601.',
      });
    }
    referenceStart = new Date(referenceStartRaw).toISOString();
  }

  if (referenceEndRaw !== undefined) {
    if (typeof referenceEndRaw !== 'string' || isNaN(Date.parse(referenceEndRaw))) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
        message: 'A data reference_end fornecida é inválida. Use o formato ISO 8601.',
      });
    }
    referenceEnd = new Date(referenceEndRaw).toISOString();
  }

  try {
    const { data: enterprise, error: enterpriseError } = await supabase
      .from('enterprise')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (enterpriseError || !enterprise) {
      return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
    }

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

    const [primary, reference] = await Promise.all([
      computeFeedbackStats({
        enterpriseId: enterprise.id,
        collectionPointIds: filteredCollectionPointIds,
        startDate: primaryStart,
        endDate: primaryEnd,
      }),
      computeFeedbackStats({
        enterpriseId: enterprise.id,
        collectionPointIds: filteredCollectionPointIds,
        startDate: referenceStart,
        endDate: referenceEnd,
      }),
    ]);

    const totalFeedbacksDiff = primary.totalFeedbacks - reference.totalFeedbacks;
    const totalFeedbacksPct =
      reference.totalFeedbacks > 0
        ? Math.round((totalFeedbacksDiff / reference.totalFeedbacks) * 1000) / 10
        : null;

    const deltas = {
      totalFeedbacks: {
        absolute: totalFeedbacksDiff,
        percentage: totalFeedbacksPct,
      },
      averageRating: {
        absolute: Math.round((primary.averageRating - reference.averageRating) * 10) / 10,
        percentage: reference.totalFeedbacks > 0 ? undefined : null,
      },
      netSatisfaction: {
        absolute: Math.round((primary.netSatisfaction - reference.netSatisfaction) * 10) / 10,
      },
      csat: {
        absolute: Math.round(((primary.csat?.pct ?? 0) - (reference.csat?.pct ?? 0)) * 10) / 10,
      },
      netSentimentScore:
        primary.aiSentiment && reference.aiSentiment
          ? {
              absolute:
                Math.round(
                  (primary.aiSentiment.netSentimentScore - reference.aiSentiment.netSentimentScore) * 10,
                ) / 10,
            }
          : undefined,
    };

    return res.json({
      primary,
      reference,
      deltas,
    });
  } catch (error) {
    console.error('Erro ao comparar estatísticas:', error);
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

type AnswerValueKey = 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';

/**
 * Estado de uma redação de pergunta/subpergunta nas métricas:
 * - `current`: ativa e com o texto atual da config (aparece em "Atuais").
 * - `deactivated`: a config ainda tem esta redação, mas está desativada (toggle off).
 *   Reativar a traz de volta para "Atuais" com todo o histórico (id estável).
 * - `past`: redação antiga (texto editado) ou pergunta removida da config.
 */
type QuestionMetricStatus = 'current' | 'deactivated' | 'past';

type ConfigEntry = { text: string; isActive: boolean } | undefined;

type QuestionAnswerAgg = {
  /** question_id ou subquestion_id (estável; a redação pode mudar com o tempo). */
  id: string;
  /** Snapshot da redação exata respondida pelo cliente (já trimada). */
  text: string;
  counts: Record<number, number>;
  distribution: Record<AnswerValueKey, number>;
};

/**
 * Separador para a chave composta (id + redação). Cada redação distinta de uma
 * mesma pergunta vira uma entrada própria — assim "Atuais" e "Antigas" não se misturam.
 */
const AGG_KEY_SEP = String.fromCharCode(1);

function newAnswerAgg(id: string, text: string): QuestionAnswerAgg {
  return {
    id,
    text,
    counts: {},
    distribution: { PESSIMO: 0, RUIM: 0, MEDIANA: 0, BOA: 0, OTIMA: 0 },
  };
}

function addAnswerToAgg(
  map: Map<string, QuestionAnswerAgg>,
  id: string,
  text: string,
  answerValue: AnswerValueKey,
  answerScore: number,
) {
  const key = `${id}${AGG_KEY_SEP}${text}`;
  const acc = map.get(key) ?? newAnswerAgg(id, text);
  acc.counts[answerScore] = (acc.counts[answerScore] ?? 0) + 1;
  acc.distribution[answerValue] += 1;
  map.set(key, acc);
}

function aggToMetricFields(agg: QuestionAnswerAgg) {
  const rs = ratingStats(agg.counts);
  return {
    count: rs.n,
    mean: rs.mean,
    ci: rs.ci,
    satisfiedPct: csatTopTwoBox(agg.counts).pct,
    distribution: agg.distribution,
    confidenceTier: confidenceTier(rs.n),
  };
}

/**
 * Métricas por pergunta/subpergunta (escala 1–5), agregadas no escopo: nota
 * média + IC, % satisfeitos (BOA+ÓTIMA), distribuição e camada de confiança.
 * Determinístico — só estatística sobre as respostas estruturadas. Ordenado
 * pior→melhor (menor nota no topo).
 */
export async function getFeedbacksQuestionsController(req: Request, res: Response) {
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
    if (filteredCollectionPointIds && filteredCollectionPointIds.length === 0) {
      return res.json({ questions: [] });
    }

    let feedbackQuery = supabase
      .from('feedback')
      .select('id')
      .eq('enterprise_id', enterprise.id);
    if (filteredCollectionPointIds) {
      feedbackQuery = feedbackQuery.in('collection_point_id', filteredCollectionPointIds);
    }

    const { data: feedbackRows, error: feedbackError } = await feedbackQuery;
    if (feedbackError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);

    const feedbackIds = ((feedbackRows ?? []) as { id: string }[]).map((f) => f.id);
    if (feedbackIds.length === 0) return res.json({ questions: [] });

    // Respostas das perguntas → agrega por pergunta.
    const { data: answerRows, error: answersError } = await supabase
      .from('feedback_question_answers')
      .select('question_id, question_text_snapshot, answer_value, answer_score')
      .in('feedback_id', feedbackIds);
    if (answersError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);

    // Agrupa as respostas por (question_id + redação do snapshot): cada redação
    // distinta vira uma entrada própria, para separar "atuais" de "antigas".
    const questionAgg = new Map<string, QuestionAnswerAgg>();
    for (const row of (answerRows ?? []) as {
      question_id: string;
      question_text_snapshot: string;
      answer_value: AnswerValueKey;
      answer_score: number;
    }[]) {
      addAnswerToAgg(questionAgg, row.question_id, String(row.question_text_snapshot ?? '').trim(), row.answer_value, row.answer_score);
    }

    // Respostas das subperguntas → agrega por (subquestion_id + redação).
    const { data: subAnswerRows, error: subAnswersError } = await supabase
      .from('feedback_subquestion_answers')
      .select('subquestion_id, subquestion_text_snapshot, answer_value, answer_score')
      .in('feedback_id', feedbackIds);
    if (subAnswersError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);

    const subAgg = new Map<string, QuestionAnswerAgg>();
    for (const row of (subAnswerRows ?? []) as {
      subquestion_id: string;
      subquestion_text_snapshot: string;
      answer_value: AnswerValueKey;
      answer_score: number;
    }[]) {
      addAnswerToAgg(subAgg, row.subquestion_id, String(row.subquestion_text_snapshot ?? '').trim(), row.answer_value, row.answer_score);
    }

    // Config ATUAL das perguntas (texto + is_active) por id — base da classificação
    // "atual" (ativa + texto igual ao configurado) vs "antiga" (editada/removida).
    const currentQ = new Map<string, { text: string; isActive: boolean }>();
    const questionIds = [...new Set([...questionAgg.values()].map((a) => a.id))];
    if (questionIds.length > 0) {
      const { data: qDefs, error: qDefsError } = await supabase
        .from('questions_of_feedbacks')
        .select('id, question_text, is_active')
        .in('id', questionIds);
      if (qDefsError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);
      for (const def of (qDefs ?? []) as { id: string; question_text: string; is_active: boolean }[]) {
        currentQ.set(def.id, { text: String(def.question_text ?? '').trim(), isActive: def.is_active === true });
      }
    }

    // Config ATUAL das subperguntas (texto + is_active) + mapeamento subpergunta → pai.
    const subParentBySubId = new Map<string, string>();
    const currentSub = new Map<string, { text: string; isActive: boolean }>();
    const subIds = [...new Set([...subAgg.values()].map((a) => a.id))];
    if (subIds.length > 0) {
      const { data: subDefs, error: subDefsError } = await supabase
        .from('feedback_question_subquestions')
        .select('id, question_id, subquestion_text, is_active')
        .in('id', subIds);
      if (subDefsError) return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);
      for (const def of (subDefs ?? []) as { id: string; question_id: string; subquestion_text: string; is_active: boolean }[]) {
        subParentBySubId.set(def.id, def.question_id);
        currentSub.set(def.id, { text: String(def.subquestion_text ?? '').trim(), isActive: def.is_active === true });
      }
    }

    // Subperguntas agrupadas por pergunta-pai (todas as redações; cada uma com status).
    const subsByQuestion = new Map<string, ReturnType<typeof buildSubMetric>[]>();
    for (const agg of subAgg.values()) {
      const parentId = subParentBySubId.get(agg.id);
      if (!parentId) continue;
      const status = subMetricStatus(currentQ.get(parentId), currentSub.get(agg.id), agg.text);
      const list = subsByQuestion.get(parentId) ?? [];
      list.push(buildSubMetric(agg, status));
      subsByQuestion.set(parentId, list);
    }
    for (const list of subsByQuestion.values()) {
      list.sort((a, b) => a.mean - b.mean);
    }

    // Agrupa as entradas por question_id para eleger a redação que hospeda as
    // subperguntas (a redação "viva" — a que casa com o texto da config, seja
    // atual ou desativada; senão a primeira) — evita duplicar entre redações.
    const entriesByQid = new Map<string, QuestionAnswerAgg[]>();
    for (const agg of questionAgg.values()) {
      const list = entriesByQid.get(agg.id) ?? [];
      list.push(agg);
      entriesByQid.set(agg.id, list);
    }

    const questions = [...entriesByQid.entries()]
      .flatMap(([qid, aggs]) => {
        const cfg = currentQ.get(qid);
        const host = aggs.find((a) => cfg?.text === a.text) ?? aggs[0];
        return aggs.map((agg) => ({
          question_id: qid,
          text: agg.text,
          ...aggToMetricFields(agg),
          status: questionMetricStatus(cfg, agg.text),
          subquestions: agg === host ? (subsByQuestion.get(qid) ?? []) : [],
        }));
      })
      .sort((a, b) => a.mean - b.mean);

    return res.json({ questions });
  } catch (error) {
    console.error('Erro ao buscar métricas por pergunta:', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}

/** Estado da redação de uma pergunta vs a config atual (ver QuestionMetricStatus). */
function questionMetricStatus(cfg: ConfigEntry, snapshot: string): QuestionMetricStatus {
  if (cfg && cfg.text === snapshot) return cfg.isActive ? 'current' : 'deactivated';
  return 'past';
}

/** Estado de uma subpergunta: "atual" só com pai ativo + subpergunta ativa + texto atual. */
function subMetricStatus(
  parentCfg: ConfigEntry,
  subCfg: ConfigEntry,
  snapshot: string,
): QuestionMetricStatus {
  if (subCfg && subCfg.text === snapshot) {
    return parentCfg?.isActive === true && subCfg.isActive === true ? 'current' : 'deactivated';
  }
  return 'past';
}

function buildSubMetric(agg: QuestionAnswerAgg, status: QuestionMetricStatus) {
  return { subquestion_id: agg.id, text: agg.text, ...aggToMetricFields(agg), status };
}
