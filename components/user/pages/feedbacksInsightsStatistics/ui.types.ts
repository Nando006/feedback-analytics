import type { LoaderFeedbacksInsightsStatistics } from 'src/routes/loaders/loaderFeedbacksInsightsStatistics';

export interface InsightsStatisticsErrorStateProps {
  error: string;
}

type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksInsightsStatistics>
>['summary'];

export interface InsightsStatisticsSentimentSectionProps {
  summary: NonNullable<Summary>;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

export interface InsightsStatisticsThemesSectionProps {
  summary: NonNullable<Summary>;
}
