import type { Feedback } from 'lib/interfaces/domain/feedback.domain';

/**
 * Props do modal de detalhes do feedback.
 * Usado em: components/user/pages/feedbacksAll/FeedbackDetailsModal.tsx.
 */
export interface FeedbackDetailsModalProps {
  selectedFeedback: Feedback;
  onClose: () => void;
}

/**
 * Props do estado de erro da tela de feedbacks completos.
 * Usado em: components/user/pages/feedbacksAll/FeedbacksAllErrorState.tsx.
 */
export interface FeedbacksAllErrorStateProps {
  error: string;
}

/**
 * Props do estado vazio da tela de feedbacks completos.
 * Usado em: components/user/pages/feedbacksAll/FeedbacksAllEmptyState.tsx.
 */
export interface FeedbacksAllEmptyStateProps {
  hasFilters: boolean;
}
