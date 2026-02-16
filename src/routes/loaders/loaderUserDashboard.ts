import type { LoaderFunctionArgs } from 'react-router-dom';
import type { Feedback, FeedbackStats } from 'lib/interfaces/user/feedback';
import { loadFeedbackStatsData } from 'src/routes/load/loadFeedbackStats';
import { loadFeedbacksData } from 'src/routes/load/loadFeedbacks';

const LATEST_LIMIT = 5;

export async function LoaderUserDashboard(_args: LoaderFunctionArgs) {
  void _args;

  const [stats, latestFeedbacks] = await Promise.all([
    loadFeedbackStatsData(),
    loadFeedbacksData({ limit: LATEST_LIMIT, page: 1 }),
  ]);

  const feedbackStats: FeedbackStats | null = stats;
  const recentFeedbacks: Feedback[] = latestFeedbacks ?? [];
  const dashboardError =
    feedbackStats !== null && latestFeedbacks !== null
      ? null
      : 'Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.';

  return {
    stats: feedbackStats,
    latestFeedbacks: recentFeedbacks,
    dashboardError,
  };
}