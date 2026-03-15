import type { FeedbackAnalysisSummary } from 'lib/interfaces/domain/feedback.domain';

export type InsightScopeOption = 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

export type InsightsCatalogItemOption = {
  id: string;
  name: string;
  kind: Exclude<InsightScopeOption, 'COMPANY'>;
};

/**
 * Props do cabeçalho da tela de insights em relatório.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportHeaderSection.tsx.
 */
export interface InsightsReportHeaderSectionProps {
  updatedLabel: string | null;
  refreshing: boolean;
  selectedScope: InsightScopeOption;
  selectedCatalogItemId: string;
  catalogItemOptions: InsightsCatalogItemOption[];
  onScopeChange: (scope: InsightScopeOption) => void;
  onCatalogItemChange: (catalogItemId: string) => void;
  onRefreshSelected: () => void;
  onRefreshAll: () => void;
}

/**
 * Tons de sentimento usados no bloco de humor.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportMoodSection.tsx.
 */
export type MoodTone = 'positive' | 'neutral' | 'negative';

/**
 * Estrutura de dados do cartão de humor.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportMoodSection.tsx.
 */
export type MoodData = {
  label: string;
  tone: MoodTone;
  description: string;
};

/**
 * Props da seção de humor dos insights.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportMoodSection.tsx.
 */
export interface InsightsReportMoodSectionProps {
  mood: MoodData;
  summary: FeedbackAnalysisSummary | null;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

/**
 * Props da seção de resumo textual dos insights.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportSummarySection.tsx.
 */
export interface InsightsReportSummarySectionProps {
  summaryText: string;
}

/**
 * Props da seção de recomendações dos insights.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportRecommendationsSection.tsx.
 */
export interface InsightsReportRecommendationsSectionProps {
  recommendations: string[];
}

/**
 * Props do estado de erro da tela de insights em relatório.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportErrorState.tsx.
 */
export interface InsightsReportErrorStateProps {
  error: string;
  variant?: 'error' | 'warning';
}

/**
 * Props do estado vazio da tela de insights em relatório.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportEmptyState.tsx.
 */
export interface InsightsReportEmptyStateProps {
  refreshing: boolean;
  onRefresh: () => void;
}
