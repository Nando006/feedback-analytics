import type {
  ConfidenceTier,
  FeedbackAnalysisSummary,
  FeedbackInsightsReport,
} from 'lib/interfaces/domain/feedback.domain';

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
  canAnalyze: boolean;
  analysisBlockedMessage: string | null;
}

/**
 * Props dos controles de insights no header global.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsHeaderControls.tsx.
 */
export interface InsightsHeaderControlsProps {
  availableScopes: InsightScopeOption[];
  selectedScope: InsightScopeOption;
  selectedCatalogItemId: string;
  catalogItemOptions: InsightsCatalogItemOption[];
  onScopeChange: (scope: InsightScopeOption) => void;
  onCatalogItemChange: (id: string) => void;
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
  /** Net Sentiment Score (-100..100) do escopo; null/undefined quando sem dados. */
  nss?: number;
  /** Camada de confiança pela quantidade de feedbacks analisados. */
  confidenceTier?: ConfidenceTier;
  /** Exibir o número do NSS (só com amostra suficiente). */
  showNss?: boolean;
}

/**
 * Props do conteúdo (resumo + recomendações) do relatório de insights.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportContent.tsx.
 */
export interface InsightsReportContentProps {
  report: FeedbackInsightsReport | null;
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
  onClose: () => void;
}

/**
 * Props do estado vazio da tela de insights em relatório.
 * Usado em: components/user/pages/feedbacksInsightsReport/InsightsReportEmptyState.tsx.
 */
export interface InsightsReportEmptyStateProps {
  refreshing: boolean;
  onRefresh: () => void;
}
