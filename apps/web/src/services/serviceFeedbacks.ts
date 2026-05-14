import type {
  FeedbacksResponse,
  FeedbackStats,
  FeedbackFilters,
  FeedbackAnalysisResponse,
  FeedbackInsightsReport,
  FeedbackAnalysisOptions,
  FeedbackInsightsReportOptions,
} from 'lib/interfaces/domain/feedback.domain';
import type {
  IaAnalyzeRawRunRequest,
  IaAnalyzeRawRunResponse,
  IaAnalyzeRegenerateInsightsRequest,
  IaAnalyzeRegenerateInsightsResponse,
} from 'lib/interfaces/contracts/ia-analyze/run.contract';
import { getJson, postJson } from 'src/lib/utils/http';

export function ServiceGetFeedbacks(filters: FeedbackFilters = {}) {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.rating) params.append('rating', filters.rating.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.item) params.append('item', filters.item);

  const queryString = params.toString();
  const url = `/api/protected/user/feedbacks${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbacksResponse>(url);
}

export function ServiceGetFeedbackStats() {
  return getJson<FeedbackStats>('/api/protected/user/feedbacks/stats');
}

export function ServiceGetFeedbackAnalysis(params?: FeedbackAnalysisOptions) {
  const searchParams = new URLSearchParams();

  if (params?.sentiment) {
    searchParams.append('sentiment', params.sentiment);
  }

  if (params?.scope_type) {
    searchParams.append('scope_type', params.scope_type);
  }

  if (params?.catalog_item_id) {
    searchParams.append('catalog_item_id', params.catalog_item_id);
  }

  const queryString = searchParams.toString();
  const url = `/api/protected/user/feedbacks/analysis${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbackAnalysisResponse>(url);
}

export function ServiceGetFeedbackInsightsReport(
  params?: FeedbackInsightsReportOptions,
) {
  const searchParams = new URLSearchParams();

  if (params?.scope_type) {
    searchParams.append('scope_type', params.scope_type);
  }

  if (params?.catalog_item_id) {
    searchParams.append('catalog_item_id', params.catalog_item_id);
  }

  const queryString = searchParams.toString();
  const url = `/api/protected/user/feedbacks/insights/report${
    queryString ? `?${queryString}` : ''
  }`;

  return getJson<FeedbackInsightsReport>(
    url,
  );
}

export type FeedbackIaRawRunResult = IaAnalyzeRawRunResponse;
export type FeedbackIaRawRunOptions = IaAnalyzeRawRunRequest;

export type FeedbackIaRegenerateInsightsResult = IaAnalyzeRegenerateInsightsResponse;
export type FeedbackIaRegenerateInsightsOptions = IaAnalyzeRegenerateInsightsRequest;

export function ServiceRunRawFeedbackAnalysis(options?: FeedbackIaRawRunOptions) {
  return postJson<FeedbackIaRawRunResult>(
    '/api/protected/ia-analyze/analyze-raw',
    options ?? {},
  );
}

export function ServiceRunFeedbackIAAnalysis(options?: FeedbackIaRegenerateInsightsOptions) {
  return postJson<FeedbackIaRegenerateInsightsResult>(
    '/api/protected/ia-analyze/regenerate-insights',
    options ?? {},
  );
}
