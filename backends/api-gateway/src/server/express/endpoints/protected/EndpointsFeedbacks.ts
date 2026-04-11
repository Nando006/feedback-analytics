import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_FAILED_TO_COUNT_FEEDBACKS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACKS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS,
  API_ERROR_FAILED_TO_FETCH_FEEDBACK_INSIGHTS_REPORT,
  API_ERROR_FAILED_TO_FETCH_STATS,
  API_ERROR_INTERNAL_SERVER_ERROR,
} from 'lib/constants/server/errors.js';
import { normalizeFeedbackAnalysisRows } from 'lib/utils/normalizeFeedbackAnalysisRows.js';
import { sendTypedError } from 'lib/utils/sendTypedError.js';

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

function resolveCollectionPoint(
  collectionPointRaw:
    | FeedbackCollectionPoint
    | FeedbackCollectionPoint[]
    | null
    | undefined,
) {
  if (Array.isArray(collectionPointRaw)) {
    return collectionPointRaw[0] ?? null;
  }

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

export function EndpointsFeedbacks(app: express.Express) {
  // Busca feedbacks da empresa com paginação
  app.get('/api/protected/user/feedbacks', requireAuth, async (req, res) => {
    const supabase = req.supabase!;
    const user = req.user!;

    // Parâmetros de paginação
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Parâmetros de filtro
    const rating = req.query.rating
      ? parseInt(req.query.rating as string)
      : null;
    const search = (req.query.search as string) || '';
    const item = String(req.query.item ?? '').trim();
    const categoryRaw = String(req.query.category ?? '')
      .trim()
      .toUpperCase();

    const category =
      categoryRaw === 'COMPANY' ||
      categoryRaw === 'PRODUCT' ||
      categoryRaw === 'SERVICE' ||
      categoryRaw === 'DEPARTMENT'
        ? categoryRaw
        : null;

    try {
      // Primeiro, buscar a empresa do usuário
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

            if (companyCpError) {
              return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);
            }

            filteredCollectionPointIds = (companyCollectionPoints ?? []).map((cp) => cp.id);
          }
        } else {
          let catalogQuery = supabase
            .from('catalog_items')
            .select('id')
            .eq('enterprise_id', enterprise.id);

          if (category) {
            catalogQuery = catalogQuery.eq('kind', category);
          }

          if (item) {
            catalogQuery = catalogQuery.ilike('name', `%${item}%`);
          }

          const { data: catalogItems, error: catalogItemsError } = await catalogQuery;

          if (catalogItemsError) {
            return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);
          }

          const catalogItemIds = (catalogItems ?? []).map((catalogItem) => catalogItem.id);

          if (catalogItemIds.length === 0) {
            filteredCollectionPointIds = [];
          } else {
            const { data: catalogCollectionPoints, error: catalogCpError } = await supabase
              .from('collection_points')
              .select('id')
              .eq('enterprise_id', enterprise.id)
              .in('catalog_item_id', catalogItemIds);

            if (catalogCpError) {
              return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);
            }

            filteredCollectionPointIds = (catalogCollectionPoints ?? []).map((cp) => cp.id);
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

      // Construir query base
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

      // Aplicar filtros
      if (rating) {
        query = query.eq('rating', rating);
      }

      if (search) {
        query = query.ilike('message', `%${search}%`);
      }

      if (filteredCollectionPointIds) {
        query = query.in('collection_point_id', filteredCollectionPointIds);
      }

      // Buscar total de registros para paginação (query separada)
      let countQuery = supabase
        .from('feedback')
        .select('*', { count: 'exact', head: true })
        .eq('enterprise_id', enterprise.id);

      if (rating) {
        countQuery = countQuery.eq('rating', rating);
      }

      if (search) {
        countQuery = countQuery.ilike('message', `%${search}%`);
      }

      if (filteredCollectionPointIds) {
        countQuery = countQuery.in('collection_point_id', filteredCollectionPointIds);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        return sendTypedError(res, 500, API_ERROR_FAILED_TO_COUNT_FEEDBACKS);
      }

      // Buscar dados com paginação
      const { data: feedbacks, error: feedbacksError } = await query.range(
        offset,
        offset + limit - 1,
      );

      if (feedbacksError) {
        return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);
      }

      // Calcular informações de paginação
      const totalPages = Math.ceil((count || 0) / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      const catalogItemIds = Array.from(
        new Set(
          (feedbacks ?? [])
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

        if (catalogRowsError) {
          return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACKS);
        }

        catalogItemById = new Map(
          (catalogRows ?? [])
            .map((row) => {
              const normalizedKind = String(row.kind ?? '').toUpperCase();
              const kind =
                normalizedKind === 'PRODUCT' ||
                normalizedKind === 'SERVICE' ||
                normalizedKind === 'DEPARTMENT'
                  ? normalizedKind
                  : null;

              if (!kind || typeof row.id !== 'string') {
                return null;
              }

              return [row.id, { name: row.name, kind }] as const;
            })
            .filter((entry): entry is readonly [string, { name: string; kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' }] => Boolean(entry)),
        );

      }

      const normalizedFeedbacks = (feedbacks ?? []).map((feedback) => {
        const collectionPoint = resolveCollectionPoint(feedback.collection_points);

        if (!collectionPoint) {
          return feedback;
        }

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
          .select(
            'feedback_id, question_id, question_text_snapshot, answer_value, answer_score, created_at',
          )
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
          hasNextPage,
          hasPreviousPage,
        },
      });
    } catch (error) {
      console.error('Erro ao buscar feedbacks:', error);
      return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
    }
  });

  // Busca estatísticas dos feedbacks
  app.get(
    '/api/protected/user/feedbacks/stats',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      try {
        // Buscar a empresa do usuário
        const { data: enterprise, error: enterpriseError } = await supabase
          .from('enterprise')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (enterpriseError || !enterprise) {
          return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
        }

        // Buscar estatísticas
        const { data: stats, error: statsError } = await supabase
          .from('feedback')
          .select('rating')
          .eq('enterprise_id', enterprise.id);

        if (statsError) {
          return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_STATS);
        }

        // Calcular estatísticas
        const totalFeedbacks = stats?.length || 0;
        const averageRating =
          totalFeedbacks > 0
            ? stats.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
            : 0;

        const ratingDistribution = {
          1: stats?.filter((f) => f.rating === 1).length || 0,
          2: stats?.filter((f) => f.rating === 2).length || 0,
          3: stats?.filter((f) => f.rating === 3).length || 0,
          4: stats?.filter((f) => f.rating === 4).length || 0,
          5: stats?.filter((f) => f.rating === 5).length || 0,
        };

        const positiveFeedbacks = ratingDistribution[4] + ratingDistribution[5];
        const negativeFeedbacks = ratingDistribution[1] + ratingDistribution[2];
        const neutralFeedbacks = ratingDistribution[3];

        return res.json({
          totalFeedbacks,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
          sentimentBreakdown: {
            positive: positiveFeedbacks,
            neutral: neutralFeedbacks,
            negative: negativeFeedbacks,
          },
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
      }
    },
  );

  // Relatório global de insights (resumo + recomendações) gerado pela IA
  app.get(
    '/api/protected/user/feedbacks/insights/report',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;
      const scopeType = parseInsightScopeType(req.query.scope_type) ?? 'COMPANY';
      const catalogItemId = String(req.query.catalog_item_id ?? '').trim() || null;

      try {
        // Buscar a empresa do usuário
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
          .select(
            'summary, recommendations, updated_at, scope_type, catalog_item_id',
          )
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
            return res.json({
              summary: null,
              recommendations: [],
              updatedAt: null,
              scopeType,
              catalogItemId,
            });
          }

          return res.json({
            summary: (report.summary as string | null) ?? null,
            recommendations: ((report.recommendations ??
              []) as string[]).filter((rec) => !!rec && rec.trim().length > 0),
            updatedAt: (report.updated_at as string | null) ?? null,
            scopeType: (report.scope_type as string | null) ?? scopeType,
            catalogItemId: (report.catalog_item_id as string | null) ?? catalogItemId,
          });
        }

        if (scopeType !== 'COMPANY' || catalogItemId) {
          return res.json({
            summary: null,
            recommendations: [],
            updatedAt: null,
            scopeType,
            catalogItemId,
          });
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
          return res.json({
            summary: null,
            recommendations: [],
            updatedAt: null,
            scopeType,
            catalogItemId,
          });
        }

        return res.json({
          summary: (legacyReport.summary as string | null) ?? null,
          recommendations: ((legacyReport.recommendations ??
            []) as string[]).filter((rec) => !!rec && rec.trim().length > 0),
          updatedAt: (legacyReport.updated_at as string | null) ?? null,
          scopeType,
          catalogItemId,
        });
      } catch (error) {
        console.error('Erro ao buscar relatório de insights (IA):', error);
        return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
      }
    },
  );

  // Busca análises de feedbacks geradas pela IA (feedback_analysis)
  app.get(
    '/api/protected/user/feedbacks/analysis',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      // Filtro opcional por sentimento: positive | neutral | negative
      const sentimentFilter = (req.query.sentiment as
        | 'positive'
        | 'neutral'
        | 'negative'
        | undefined) ?? undefined;
      const scopeType = parseInsightScopeType(req.query.scope_type);
      const catalogItemId = String(req.query.catalog_item_id ?? '').trim() || null;

      try {
        // Buscar a empresa do usuário
        const { data: enterprise, error: enterpriseError } = await supabase
          .from('enterprise')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (enterpriseError || !enterprise) {
          return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
        }

        let filteredCollectionPointIds: string[] | null = null;

        if (scopeType || catalogItemId) {
          if (scopeType === 'COMPANY') {
            if (catalogItemId) {
              filteredCollectionPointIds = [];
            } else {
              const { data: companyCollectionPoints, error: companyCpError } = await supabase
                .from('collection_points')
                .select('id')
                .eq('enterprise_id', enterprise.id)
                .is('catalog_item_id', null);

              if (companyCpError) {
                return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS);
              }

              filteredCollectionPointIds = (companyCollectionPoints ?? []).map((cp) => cp.id);
            }
          } else if (catalogItemId) {
            const pointsQuery = supabase
              .from('collection_points')
              .select('id')
              .eq('enterprise_id', enterprise.id)
              .eq('catalog_item_id', catalogItemId);

            if (scopeType) {
              const { data: catalogItem, error: catalogItemError } = await supabase
                .from('catalog_items')
                .select('id')
                .eq('enterprise_id', enterprise.id)
                .eq('id', catalogItemId)
                .eq('kind', scopeType)
                .maybeSingle();

              if (catalogItemError) {
                return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS);
              }

              if (!catalogItem) {
                filteredCollectionPointIds = [];
              }
            }

            if (!filteredCollectionPointIds) {
              const { data: points, error: pointsError } = await pointsQuery;

              if (pointsError) {
                return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS);
              }

              filteredCollectionPointIds = (points ?? []).map((cp) => cp.id);
            }
          } else if (scopeType) {
            const { data: catalogItems, error: catalogItemsError } = await supabase
              .from('catalog_items')
              .select('id')
              .eq('enterprise_id', enterprise.id)
              .eq('kind', scopeType);

            if (catalogItemsError) {
              return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS);
            }

            const catalogIds = (catalogItems ?? []).map((item) => item.id);

            if (catalogIds.length === 0) {
              filteredCollectionPointIds = [];
            } else {
              const { data: points, error: pointsError } = await supabase
                .from('collection_points')
                .select('id')
                .eq('enterprise_id', enterprise.id)
                .in('catalog_item_id', catalogIds);

              if (pointsError) {
                return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS);
              }

              filteredCollectionPointIds = (points ?? []).map((cp) => cp.id);
            }
          }
        }

        if (filteredCollectionPointIds && filteredCollectionPointIds.length === 0) {
          return res.json({
            items: [],
            summary: {
              totalAnalyzed: 0,
              sentiments: {
                positive: 0,
                neutral: 0,
                negative: 0,
              },
              topCategories: [],
              topKeywords: [],
            },
          });
        }

        // Buscar feedbacks com análise associada
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
              keywords
            )
          `,
          )
          .eq('enterprise_id', enterprise.id);

        if (filteredCollectionPointIds) {
          query = query.in('collection_point_id', filteredCollectionPointIds);
        }

        if (sentimentFilter) {
          query = query.eq('feedback_analysis.sentiment', sentimentFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Erro ao buscar análises de feedbacks:', error);
          return sendTypedError(res, 500, API_ERROR_FAILED_TO_FETCH_FEEDBACK_ANALYSIS);
        }

        const itemsRaw = normalizeFeedbackAnalysisRows(data);

        if (itemsRaw.length === 0) {
          return res.json({
            items: [],
            summary: {
              totalAnalyzed: 0,
              sentiments: {
                positive: 0,
                neutral: 0,
                negative: 0,
              },
              topCategories: [],
              topKeywords: [],
            },
          });
        }

        const items = itemsRaw.map((row) => ({
          id: row.id,
          message: row.message,
          rating: row.rating,
          created_at: row.created_at,
          sentiment: row.feedback_analysis.sentiment,
          categories: row.feedback_analysis.categories ?? [],
          keywords: row.feedback_analysis.keywords ?? [],
        }));

        // Agregações em memória
        const sentiments = {
          positive: 0,
          neutral: 0,
          negative: 0,
        };

        const categoryCounts: Record<string, number> = {};
        const keywordCounts: Record<string, number> = {};

        for (const item of items) {
          sentiments[item.sentiment]++;

          for (const category of item.categories) {
            const key = category.trim().toLowerCase();
            if (!key) continue;
            categoryCounts[key] = (categoryCounts[key] ?? 0) + 1;
          }

          for (const keyword of item.keywords) {
            const key = keyword.trim().toLowerCase();
            if (!key) continue;
            keywordCounts[key] = (keywordCounts[key] ?? 0) + 1;
          }
        }

        const topCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        const topKeywords = Object.entries(keywordCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return res.json({
          items,
          summary: {
            totalAnalyzed: items.length,
            sentiments,
            topCategories,
            topKeywords,
          },
        });
      } catch (error) {
        console.error('Erro ao buscar análises de feedbacks (IA):', error);
        return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
      }
    },
  );
}
