import type {
  FeedbackStats,
  FeedbackStatsOptions,
} from 'lib/interfaces/domain/feedback.domain';
import { ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';

export async function loadFeedbackStatsData(
  options?: FeedbackStatsOptions,
): Promise<FeedbackStats | null> {
  return ServiceGetFeedbackStats(options).catch(() => null);
}