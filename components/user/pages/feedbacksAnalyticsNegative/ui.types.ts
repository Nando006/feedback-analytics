import type { LoaderFeedbacksAnalyticsNegative } from 'src/routes/loaders/loaderFeedbacksAnalyticsNegative';

/**
 * Props do estado de erro da tela de analytics negativos.
 * Usado em: components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeErrorState.tsx.
 */
export interface AnalyticsNegativeErrorStateProps {
  error: string;
}

/**
 * Tipo auxiliar do resumo retornado pelo loader de analytics negativos.
 * Usado em: components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeSummarySection.tsx.
 */
type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksAnalyticsNegative>
>['summary'];
/**
 * Tipo auxiliar da lista de itens retornada pelo loader de analytics negativos.
 * Usado em: components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeItemsSection.tsx.
 */
type Items = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsNegative>>['items'];

/**
 * Props da seção de resumo de analytics negativos.
 * Usado em: components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeSummarySection.tsx.
 */
export interface AnalyticsNegativeSummarySectionProps {
  summary: NonNullable<Summary>;
}

/**
 * Props da seção de itens de analytics negativos.
 * Usado em: components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeItemsSection.tsx.
 */
export interface AnalyticsNegativeItemsSectionProps {
  items: Items;
}
