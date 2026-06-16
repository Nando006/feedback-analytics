import type { QuestionMetric } from 'lib/interfaces/domain/feedback.domain';

/**
 * Props da seção que lista as perguntas com suas métricas.
 * Usado em: components/user/pages/feedbacksInsightsQuestions/InsightsQuestionsSection.tsx.
 */
export interface InsightsQuestionsSectionProps {
  questions: QuestionMetric[];
}
