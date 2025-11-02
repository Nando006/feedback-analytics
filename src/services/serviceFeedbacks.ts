import type {
  FeedbacksResponse,
  FeedbackStats,
  FeedbackFilters,
} from 'lib/interfaces/user/feedback';
import { getJson } from './http';

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
