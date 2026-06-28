import { count, eq, max } from 'drizzle-orm';
import { getDb } from '../db/client.js';
import { feedback, feedbackAnalysis } from '../../drizzle/schema.js';
import { scopedFeedbackWhere } from '../db/tenantScope.js';

export interface ScopedStatsParams {
  enterpriseId: string;
  /** `null` = toda a empresa; `[]` = escopo sem pontos (zero resultados). */
  collectionPointIds: string[] | null;
}

export interface ScopedRatingAggregates {
  totalFeedbacks: number;
  ratingSum: number;
  ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export interface ScopedAnalysisAggregates {
  totalAnalyzed: number;
  latestAnalysisAt: string | null;
  aiCounts: { positive: number; neutral: number; negative: number };
}

function emptyDistribution(): ScopedRatingAggregates['ratingDistribution'] {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

/** Escopo válido porém sem nenhum ponto de coleta => não há o que agregar. */
function scopeHasNoPoints(ids: string[] | null): boolean {
  return Array.isArray(ids) && ids.length === 0;
}

/**
 * Distribuição de notas (1..5), total e soma — agregados NO BANCO via
 * `GROUP BY rating` (Drizzle), em vez de somar linha a linha em JavaScript.
 * Sempre filtrado por `enterprise_id` (+ escopo opcional) pelo helper único.
 */
export async function fetchScopedRatingAggregates(
  params: ScopedStatsParams,
): Promise<ScopedRatingAggregates> {
  const { enterpriseId, collectionPointIds } = params;

  if (scopeHasNoPoints(collectionPointIds)) {
    return { totalFeedbacks: 0, ratingSum: 0, ratingDistribution: emptyDistribution() };
  }

  const rows = await getDb()
    .select({ rating: feedback.rating, c: count() })
    .from(feedback)
    .where(scopedFeedbackWhere(enterpriseId, collectionPointIds))
    .groupBy(feedback.rating);

  const ratingDistribution = emptyDistribution();
  let totalFeedbacks = 0;
  let ratingSum = 0;

  for (const row of rows) {
    const c = Number(row.c);
    totalFeedbacks += c;

    const rating = row.rating;
    if (rating != null) {
      ratingSum += rating * c;
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating as 1 | 2 | 3 | 4 | 5] = c;
      }
    }
  }

  return { totalFeedbacks, ratingSum, ratingDistribution };
}

/**
 * Agregados da análise de IA sobre o subconjunto analisado do escopo: quantos
 * feedbacks já têm análise (`feedback_analysis` é 1:1 com `feedback`), a análise
 * mais recente, e a contagem por sentimento — via `GROUP BY sentiment` num JOIN
 * `feedback_analysis × feedback`, sempre filtrado por `enterprise_id` (+ escopo).
 */
export async function fetchScopedAnalysisAggregates(
  params: ScopedStatsParams,
): Promise<ScopedAnalysisAggregates> {
  const { enterpriseId, collectionPointIds } = params;

  if (scopeHasNoPoints(collectionPointIds)) {
    return { totalAnalyzed: 0, latestAnalysisAt: null, aiCounts: { positive: 0, neutral: 0, negative: 0 } };
  }

  const rows = await getDb()
    .select({
      sentiment: feedbackAnalysis.sentiment,
      c: count(),
      latest: max(feedbackAnalysis.createdAt),
    })
    .from(feedbackAnalysis)
    .innerJoin(feedback, eq(feedbackAnalysis.feedbackId, feedback.id))
    .where(scopedFeedbackWhere(enterpriseId, collectionPointIds))
    .groupBy(feedbackAnalysis.sentiment);

  let totalAnalyzed = 0;
  let latestAnalysisAt: string | null = null;
  const aiCounts = { positive: 0, neutral: 0, negative: 0 };

  for (const row of rows) {
    const c = Number(row.c);
    totalAnalyzed += c;

    if (row.latest && (latestAnalysisAt === null || row.latest > latestAnalysisAt)) {
      latestAnalysisAt = row.latest;
    }

    const sentiment = row.sentiment;
    if (sentiment === 'positive' || sentiment === 'neutral' || sentiment === 'negative') {
      aiCounts[sentiment] += c;
    }
  }

  return { totalAnalyzed, latestAnalysisAt, aiCounts };
}
