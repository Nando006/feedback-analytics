import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';

/**
 * Props da seção de métricas principais do dashboard.
 * Usado em: components/user/pages/dashboard/SectionMetric.tsx.
 */
export interface SectionMetricProps {
  totalFeedbacks: number;
  averageRating: number;
  positive: number;
  negative: number;
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
  positive: number;
  neutral: number;
  negative: number;
}
