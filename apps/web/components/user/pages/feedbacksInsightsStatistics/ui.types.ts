import type { LoaderFeedbacksInsightsStatistics } from 'src/routes/loaders/loaderFeedbacksInsightsStatistics';

/**
 * Props do estado de erro da tela de insights estatísticos.
 * Usado em: components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsErrorState.tsx.
 */
export interface InsightsStatisticsErrorStateProps {
  error: string;
}

/**
 * Tipo auxiliar do resumo retornado pelo loader de insights estatísticos.
 * Usado em: components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsSentimentSection.tsx e InsightsStatisticsThemesSection.tsx.
 */
type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksInsightsStatistics>
>['summary'];

/**
 * Props da seção de distribuição de sentimento.
 * Usado em: components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsSentimentSection.tsx.
 */
export interface InsightsStatisticsSentimentSectionProps {
  summary: NonNullable<Summary>;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

/**
 * Props da seção de temas relevantes.
 * Usado em: components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsThemesSection.tsx.
 */
export interface InsightsStatisticsThemesSectionProps {
  summary: NonNullable<Summary>;
}
