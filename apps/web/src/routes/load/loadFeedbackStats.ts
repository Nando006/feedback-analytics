import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import { ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';

export async function loadFeedbackStatsData(): Promise<FeedbackStats | null> {
  return ServiceGetFeedbackStats().catch(() => null);
}