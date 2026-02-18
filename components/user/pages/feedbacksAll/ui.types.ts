import type { Feedback } from 'lib/interfaces/domain/feedback.domain';

export interface FeedbackDetailsModalProps {
  selectedFeedback: Feedback;
  onClose: () => void;
}

export interface FeedbacksAllErrorStateProps {
  error: string;
}

export interface FeedbacksAllEmptyStateProps {
  hasFilters: boolean;
}
