import type { FeedbackAnalysisItem } from 'lib/interfaces/domain/feedback.domain';
import type { LoaderFeedbacksInsightsEmotional } from 'src/routes/loaders/loaderFeedbacksInsightsEmotional';

/**
 * Props do estado de erro da tela de insights emocionais.
 * Usado em: components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalErrorState.tsx.
 */
export interface InsightsEmotionalErrorStateProps {
  error: string;
}

/**
 * Estrutura de agrupamento emocional dos feedbacks analisados.
 * Usado em: components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalClustersSection.tsx.
 */
export type EmotionalCluster = {
  title: string;
  description: string;
  tone: 'positive' | 'neutral' | 'negative';
  items: FeedbackAnalysisItem[];
};

/**
 * Props da seção de clusters emocionais.
 * Usado em: components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalClustersSection.tsx.
 */
export interface InsightsEmotionalClustersSectionProps {
  clusters: EmotionalCluster[];
}

/**
 * Tipo auxiliar do resumo retornado pelo loader emocional.
 * Usado em: components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalThermometerSection.tsx.
 */
type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksInsightsEmotional>
>['summary'];

/**
 * Props da seção de termômetro emocional.
 * Usado em: components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalThermometerSection.tsx.
 */
export interface InsightsEmotionalThermometerSectionProps {
  summary: NonNullable<Summary>;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}
