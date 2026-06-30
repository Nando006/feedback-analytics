import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { Interval, QuestionMetric, FeedbackStatsComparison } from 'lib/interfaces/domain/feedback.domain';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';

/**
 * Props da seção de métricas principais do dashboard.
 * Usado em: components/user/pages/dashboard/SectionMetric.tsx.
 */
export interface SectionMetricProps {
  totalFeedbacks: number;
  averageRating: number;
  positive: number;
  negative: number;
  /** Faixa provável (IC t) da média de estrelas; ausente sem feedbacks no escopo. */
  starMeanCI?: Interval | null;
}

/**
 * Tipo auxiliar das estatísticas retornadas pelo loader do dashboard.
 * Usado em: components/user/pages/dashboard/SectionEvaluationDistribution.tsx.
 */
export type DashboardStats = Awaited<
  ReturnType<typeof LoaderUserDashboard>
>['stats'];

/**
 * Props da seção de distribuição de avaliações.
 * Usado em: components/user/pages/dashboard/SectionEvaluationDistribution.tsx.
 */
export interface EvaluationDistributionProps {
  stats: DashboardStats | null;
}

/**
 * Props da seção de radar de satisfação.
 * Usado em: components/user/pages/dashboard/SectionSatisfactionRadar.tsx.
 */
export interface SectionSatisfactionRadarProps {
  /** Estatísticas do escopo (indicadores de satisfação + sentimento IA). */
  stats?: DashboardStats | null;
}

/**
 * Props do card "Perguntas com menor nota" (atalho para a aba Perguntas).
 * Usado em: components/user/pages/dashboard/SectionLowestQuestions.tsx.
 */
export interface SectionLowestQuestionsProps {
  questions: QuestionMetric[];
}

export interface SectionComparisonMetricsProps {
  data: FeedbackStatsComparison;
  datePreset: string;
  startDate?: string;
  endDate?: string;
  referenceStartDate?: string;
  referenceEndDate?: string;
  comparisonReferenceType?: 'previous_period' | 'previous_year' | 'custom';
}

export type ComparisonMetricCardProps = {
  title: string;
  value: string;
  refValue: string;
  delta: {
    absolute: number;
    percentage?: number | null;
  };
  invertColor?: boolean;
  isPercentageDelta?: boolean;
  icon: IconType;
  helper?: ReactNode;
};
