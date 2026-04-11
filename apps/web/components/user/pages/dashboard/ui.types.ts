import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { LoaderUserProtected } from 'src/routes/loaders/loaderUserProtected';

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
 * Tipo auxiliar dos feedbacks recentes retornados pelo loader do dashboard.
 * Usado em: components/user/pages/dashboard/SectionLatestFeedbacks.tsx.
 */
export type LatestFeedbacks = Awaited<
  ReturnType<typeof LoaderUserDashboard>
>['latestFeedbacks'];

/**
 * Props da seção de feedbacks recentes.
 * Usado em: components/user/pages/dashboard/SectionLatestFeedbacks.tsx.
 */
export interface LatestFeedbacksProps {
  latestFeedbacks: LatestFeedbacks;
  latestLimit: number;
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

/**
 * Tipo auxiliar de dados de coleta vindos do loader protegido.
 * Usado em: components/user/pages/dashboard/SectionCollectingStrategy.tsx.
 */
export type CollectingData = Awaited<
  ReturnType<typeof LoaderUserProtected>
>['collecting'];

/**
 * Props da seção de estratégia de coleta.
 * Usado em: components/user/pages/dashboard/SectionCollectingStrategy.tsx.
 */
export interface SectionCollectingStrategyProps {
  collecting: CollectingData | null;
}
