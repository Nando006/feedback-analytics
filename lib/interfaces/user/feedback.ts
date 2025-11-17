export interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  gender: string | null;
}

export interface TrackedDevice {
  id: string;
  device_fingerprint: string | null;
  user_agent: string | null;
  ip_address: string | null;
  feedback_count: number | null;
  is_blocked: boolean | null;
  customer_id: string | null;
  customer: Customer | null;
}

export interface CollectionPoint {
  id: string;
  name: string;
  type: 'QR_CODE' | 'EMAIL' | 'WHATSAPP' | 'LINK_DIRETO';
  identifier: string | null;
}

export interface Feedback {
  id: string;
  message: string;
  rating: number;
  created_at: string;
  updated_at: string;
  collection_points: CollectionPoint;
  tracked_devices: TrackedDevice | null;
}

export interface FeedbackPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FeedbacksResponse {
  feedbacks: Feedback[];
  pagination: FeedbackPagination;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  sentimentBreakdown: SentimentBreakdown;
}

export interface FeedbackFilters {
  page?: number;
  limit?: number;
  rating?: number;
  search?: string;
}

export type FeedbackSentiment = 'positive' | 'neutral' | 'negative';

export interface FeedbackAnalysisItem {
  id: string;
  message: string;
  rating: number | null;
  created_at: string;
  sentiment: FeedbackSentiment;
  categories: string[];
  keywords: string[];
}

export interface TopTerm {
  name: string;
  count: number;
}

export interface FeedbackAnalysisSummary {
  totalAnalyzed: number;
  sentiments: SentimentBreakdown;
  topCategories: TopTerm[];
  topKeywords: TopTerm[];
}

export interface FeedbackAnalysisResponse {
  items: FeedbackAnalysisItem[];
  summary: FeedbackAnalysisSummary;
}

export interface FeedbackInsightsReport {
  summary: string | null;
  recommendations: string[];
  updatedAt: string | null;
}