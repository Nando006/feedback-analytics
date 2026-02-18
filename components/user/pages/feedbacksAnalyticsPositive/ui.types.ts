import type { LoaderFeedbacksAnalyticsPositive } from 'src/routes/loaders/loaderFeedbacksAnalyticsPositive';

export interface AnalyticsPositiveErrorStateProps {
  error: string;
}

type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksAnalyticsPositive>
>['summary'];
type Items = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsPositive>>['items'];

export interface AnalyticsPositiveSummarySectionProps {
  summary: NonNullable<Summary>;
}

export interface AnalyticsPositiveItemsSectionProps {
  items: Items;
}
