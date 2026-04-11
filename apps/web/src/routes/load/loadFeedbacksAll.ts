import type {
  FeedbackCategory,
  Feedback,
  FeedbackFilters,
  FeedbackPagination,
  FeedbackStats,
} from 'lib/interfaces/domain/feedback.domain';
import { ServiceGetFeedbacks } from 'src/services/serviceFeedbacks';
import { loadFeedbackStatsData } from 'src/routes/load/loadFeedbackStats';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export type FeedbacksAllFilters = {
  page: number;
  limit: number;
  rating?: number;
  search: string;
  category?: FeedbackCategory;
  item: string;
};

const FEEDBACK_CATEGORIES: readonly FeedbackCategory[] = [
  'COMPANY',
  'PRODUCT',
  'SERVICE',
  'DEPARTMENT',
];

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
  const categoryRaw = (url.searchParams.get('category') ?? '').toUpperCase();
  const category = FEEDBACK_CATEGORIES.includes(categoryRaw as FeedbackCategory)
    ? (categoryRaw as FeedbackCategory)
    : undefined;

  return {
    page,
    limit,
    rating: rating && rating >= 1 && rating <= 5 ? rating : undefined,
    search: url.searchParams.get('search') ?? '',
    category,
    item: url.searchParams.get('item') ?? '',
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
      category: filters.category,
      item: filters.item ?? '',
    },
    error: feedbacksResponse ? null : 'Erro ao carregar feedbacks',
  };
}
