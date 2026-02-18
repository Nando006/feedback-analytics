import type { FeedbackAnalysisSummary } from 'lib/interfaces/domain/feedback.domain';

export interface InsightsReportHeaderSectionProps {
  updatedLabel: string | null;
  refreshing: boolean;
  onRefresh: () => void;
}

export type MoodTone = 'positive' | 'neutral' | 'negative';

export type MoodData = {
  label: string;
  tone: MoodTone;
  description: string;
};

export interface InsightsReportMoodSectionProps {
  mood: MoodData;
  summary: FeedbackAnalysisSummary | null;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

export interface InsightsReportSummarySectionProps {
  summaryText: string;
}

export interface InsightsReportRecommendationsSectionProps {
  recommendations: string[];
}

export interface InsightsReportErrorStateProps {
  error: string;
}

export interface InsightsReportEmptyStateProps {
  refreshing: boolean;
  onRefresh: () => void;
}
