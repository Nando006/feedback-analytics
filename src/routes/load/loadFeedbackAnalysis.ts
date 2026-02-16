import { ServiceGetFeedbackAnalysis } from 'src/services/serviceFeedbacks';
import type {
  FeedbackAnalysisItem,
  FeedbackAnalysisSummary,
  FeedbackSentiment,
} from 'lib/interfaces/user/feedback';

export type FeedbackAnalysisLoadData = {
  items: FeedbackAnalysisItem[];
  summary: FeedbackAnalysisSummary | null;
  error: string | null;
};

export async function loadFeedbackAnalysisData(options?: {
  sentiment?: FeedbackSentiment;
}): Promise<FeedbackAnalysisLoadData> {
  try {
    const response = await ServiceGetFeedbackAnalysis(options);

    return {
      items: response.items,
      summary: response.summary,
      error: null,
    };
  } catch (err) {
    console.error('Erro ao carregar analytics de feedbacks (IA):', err);

    return {
      items: [],
      summary: null,
      error: 'Erro ao carregar analytics de feedbacks',
    };
  }
}
