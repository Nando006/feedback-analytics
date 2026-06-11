import type { LoaderFunctionArgs } from 'react-router-dom';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import { loadFeedbackStatsData } from 'src/routes/load/loadFeedbackStats';

export async function LoaderUserDashboard(_args: LoaderFunctionArgs) {
  void _args;

  // Escopo inicial = COMPANY (Geral), igual ao padrão do seletor no header.
  const stats = await loadFeedbackStatsData({ scope_type: 'COMPANY' });

  const feedbackStats: FeedbackStats | null = stats;
  const dashboardError =
    feedbackStats !== null
      ? null
      : 'Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.';

  return {
    stats: feedbackStats,
    dashboardError,
  };
}
