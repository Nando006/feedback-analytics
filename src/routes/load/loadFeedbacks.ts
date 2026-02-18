import type { Feedback, FeedbackFilters } from 'lib/interfaces/domain/feedback.domain';
import { ServiceGetFeedbacks } from 'src/services/serviceFeedbacks';

export async function loadFeedbacksData(
  filters: FeedbackFilters = {},
): Promise<Feedback[] | null> {
  const response = await ServiceGetFeedbacks(filters).catch(() => null);
  if (!response) return null;
  return response.feedbacks;
}