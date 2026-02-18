import type { LoaderFeedbacksAnalyticsPositive } from 'src/routes/loaders/loaderFeedbacksAnalyticsPositive';

/**
 * Props do estado de erro da tela de analytics positivos.
 * Usado em: components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveErrorState.tsx.
 */
export interface AnalyticsPositiveErrorStateProps {
  error: string;
}

/**
 * Tipo auxiliar do resumo retornado pelo loader de analytics positivos.
 * Usado em: components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveSummarySection.tsx.
 */
type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksAnalyticsPositive>
>['summary'];
/**
 * Tipo auxiliar da lista de itens retornada pelo loader de analytics positivos.
 * Usado em: components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveItemsSection.tsx.
 */
type Items = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsPositive>>['items'];

/**
 * Props da seção de resumo de analytics positivos.
 * Usado em: components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveSummarySection.tsx.
 */
export interface AnalyticsPositiveSummarySectionProps {
  summary: NonNullable<Summary>;
}

/**
 * Props da seção de itens de analytics positivos.
 * Usado em: components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveItemsSection.tsx.
 */
export interface AnalyticsPositiveItemsSectionProps {
  items: Items;
}
