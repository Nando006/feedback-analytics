import type { LoaderFeedbacksAnalyticsAll } from 'src/routes/loaders/loaderFeedbacksAnalyticsAll';

/**
 * Props do estado de erro da tela de analytics geral.
 * Usado em: components/user/pages/feedbacksAnalyticsAll/AnalyticsAllErrorState.tsx.
 */
export interface AnalyticsAllErrorStateProps {
  error: string;
}

/**
 * Tipo auxiliar do resumo retornado pelo loader de analytics geral.
 * Usado em: components/user/pages/feedbacksAnalyticsAll/AnalyticsAllSummarySection.tsx e AnalyticsAllKeywordsSection.tsx.
 */
type Summary = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsAll>>['summary'];
/**
 * Tipo auxiliar da lista de itens retornada pelo loader de analytics geral.
 * Usado em: components/user/pages/feedbacksAnalyticsAll/AnalyticsAllItemsSection.tsx.
 */
type Items = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsAll>>['items'];

/**
 * Props da seção de resumo de analytics geral.
 * Usado em: components/user/pages/feedbacksAnalyticsAll/AnalyticsAllSummarySection.tsx.
 */
export interface AnalyticsAllSummarySectionProps {
  summary: NonNullable<Summary>;
}

/**
 * Props da seção de palavras-chave de analytics geral.
 * Usado em: components/user/pages/feedbacksAnalyticsAll/AnalyticsAllKeywordsSection.tsx.
 */
export interface AnalyticsAllKeywordsSectionProps {
  summary: NonNullable<Summary>;
}

/**
 * Props da seção de itens de analytics geral.
 * Usado em: components/user/pages/feedbacksAnalyticsAll/AnalyticsAllItemsSection.tsx.
 */
export interface AnalyticsAllItemsSectionProps {
  items: Items;
}
