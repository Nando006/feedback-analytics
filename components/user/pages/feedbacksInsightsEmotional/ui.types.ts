import type { FeedbackAnalysisItem } from 'lib/interfaces/domain/feedback.domain';
import type { LoaderFeedbacksInsightsEmotional } from 'src/routes/loaders/loaderFeedbacksInsightsEmotional';

export interface InsightsEmotionalErrorStateProps {
  error: string;
}

export type EmotionalCluster = {
  title: string;
  description: string;
  tone: 'positive' | 'neutral' | 'negative';
  items: FeedbackAnalysisItem[];
};

export interface InsightsEmotionalClustersSectionProps {
  clusters: EmotionalCluster[];
}

type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksInsightsEmotional>
>['summary'];

export interface InsightsEmotionalThermometerSectionProps {
  summary: NonNullable<Summary>;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}
