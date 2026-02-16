import type { FeedbackStats } from 'lib/interfaces/user/feedback';
import { ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';

export async function loadFeedbackStatsData(): Promise<FeedbackStats | null> {
  return ServiceGetFeedbackStats().catch(() => null);
}