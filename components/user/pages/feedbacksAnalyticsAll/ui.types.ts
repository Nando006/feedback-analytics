import type { LoaderFeedbacksAnalyticsAll } from 'src/routes/loaders/loaderFeedbacksAnalyticsAll';

export interface AnalyticsAllErrorStateProps {
  error: string;
}

type Summary = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsAll>>['summary'];
type Items = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsAll>>['items'];

export interface AnalyticsAllSummarySectionProps {
  summary: NonNullable<Summary>;
}

export interface AnalyticsAllKeywordsSectionProps {
  summary: NonNullable<Summary>;
}

export interface AnalyticsAllItemsSectionProps {
  items: Items;
}
