import type {
  Feedback,
  FeedbackFilters,
  FeedbackPagination,
  FeedbackStats,
} from 'lib/interfaces/user/feedback';
import { ServiceGetFeedbacks } from 'src/services/serviceFeedbacks';
import { loadFeedbackStatsData } from 'src/routes/load/loadFeedbackStats';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export type FeedbacksAllFilters = {
  page: number;
  limit: number;
  rating?: number;
  search: string;
};

export type FeedbacksAllData = {
  feedbacks: Feedback[];
  pagination: FeedbackPagination | null;
  stats: FeedbackStats | null;
  filters: FeedbacksAllFilters;
  error: string | null;
};

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.trunc(parsed);
}

export function parseFeedbacksAllFilters(url: URL): FeedbacksAllFilters {
  const page = parsePositiveInt(url.searchParams.get('page'), DEFAULT_PAGE);
  const limit = parsePositiveInt(url.searchParams.get('limit'), DEFAULT_LIMIT);
  const ratingRaw = url.searchParams.get('rating');
  const rating = ratingRaw ? parsePositiveInt(ratingRaw, NaN) : undefined;

  return {
    page,
    limit,
    rating: rating && rating >= 1 && rating <= 5 ? rating : undefined,
    search: url.searchParams.get('search') ?? '',
  };
}

export async function loadFeedbacksAllData(
  filters: FeedbackFilters,
): Promise<FeedbacksAllData> {
  const [feedbacksResponse, stats] = await Promise.all([
    ServiceGetFeedbacks(filters).catch(() => null),
    loadFeedbackStatsData(),
  ]);

  return {
    feedbacks: feedbacksResponse?.feedbacks ?? [],
    pagination: feedbacksResponse?.pagination ?? null,
    stats,
    filters: {
      page: filters.page ?? DEFAULT_PAGE,
      limit: filters.limit ?? DEFAULT_LIMIT,
      rating: filters.rating,
      search: filters.search ?? '',
    },
    error: feedbacksResponse ? null : 'Erro ao carregar feedbacks',
  };
}
