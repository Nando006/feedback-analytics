import type { LoaderFeedbacksAnalyticsNegative } from 'src/routes/loaders/loaderFeedbacksAnalyticsNegative';

export interface AnalyticsNegativeErrorStateProps {
  error: string;
}

type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksAnalyticsNegative>
>['summary'];
type Items = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsNegative>>['items'];

export interface AnalyticsNegativeSummarySectionProps {
  summary: NonNullable<Summary>;
}

export interface AnalyticsNegativeItemsSectionProps {
  items: Items;
}
