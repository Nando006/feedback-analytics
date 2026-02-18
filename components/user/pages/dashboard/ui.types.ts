import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { LoaderUserProtected } from 'src/routes/loaders/loaderUserProtected';

export interface SectionMetricProps {
  totalFeedbacks: number;
  averageRating: number;
  positive: number;
  negative: number;
}

export type LatestFeedbacks = Awaited<
  ReturnType<typeof LoaderUserDashboard>
>['latestFeedbacks'];

export interface LatestFeedbacksProps {
  latestFeedbacks: LatestFeedbacks;
  latestLimit: number;
}

export type DashboardStats = Awaited<
  ReturnType<typeof LoaderUserDashboard>
>['stats'];

export interface EvaluationDistributionProps {
  stats: DashboardStats | null;
}

export interface SectionSatisfactionRadarProps {
  positive: number;
  neutral: number;
  negative: number;
}

export type CollectingData = Awaited<
  ReturnType<typeof LoaderUserProtected>
>['collecting'];

export interface SectionCollectingStrategyProps {
  collecting: CollectingData | null;
}
