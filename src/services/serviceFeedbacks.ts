import type {
  FeedbacksResponse,
  FeedbackStats,
  FeedbackFilters,
  FeedbackAnalysisResponse,
  FeedbackSentiment,
  FeedbackInsightsReport,
} from 'lib/interfaces/user/feedback';
import { getJson, postJson } from '../../lib/utils/http';

export function ServiceGetFeedbacks(filters: FeedbackFilters = {}) {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.rating) params.append('rating', filters.rating.toString());
  if (filters.search) params.append('search', filters.search);

  const queryString = params.toString();
  const url = `/api/protected/user/feedbacks${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbacksResponse>(url);
}

export function ServiceGetFeedbackStats() {
  return getJson<FeedbackStats>('/api/protected/user/feedbacks/stats');
}

export function ServiceGetFeedbackAnalysis(params?: {
  sentiment?: FeedbackSentiment;
}) {
  const searchParams = new URLSearchParams();

  if (params?.sentiment) {
    searchParams.append('sentiment', params.sentiment);
  }

  const queryString = searchParams.toString();
  const url = `/api/protected/user/feedbacks/analysis${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbackAnalysisResponse>(url);
}

export function ServiceGetFeedbackInsightsReport() {
  return getJson<FeedbackInsightsReport>(
    '/api/protected/user/feedbacks/insights/report',
  );
}

export interface FeedbackIaRunResult {
  analyzedCount: number;
  globalInsights: {
    summary?: string;
    recommendations?: string[];
  } | null;
}

export function ServiceRunFeedbackIAAnalysis(options?: { limit?: number }) {
  return postJson<FeedbackIaRunResult>(
    '/api/protected/ia-studio/send-message',
    options ?? {},
  );
}
