import type { ChangeEvent } from 'react';
import type {
  Feedback,
  FeedbackFilters,
  FeedbackPagination,
  FeedbackStats,
} from 'lib/interfaces/domain/feedback.domain';

export interface FeedbackCardProps {
  feedback: Feedback;
  onClick?: () => void;
}

export interface FeedbackFiltersProps {
  filters: FeedbackFilters;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRatingFilter: (rating: number | undefined) => void;
  onLimitChange: (limit: number) => void;
}

export interface FeedbackHeaderProps {
  stats: FeedbackStats | null;
}

export interface FeedbackPaginationProps {
  pagination: FeedbackPagination;
  onPageChange: (page: number) => void;
}