import { ServiceGetFeedbackQuestions } from 'src/services/serviceFeedbacks';
import type {
  FeedbackQuestionsOptions,
  QuestionMetric,
} from 'lib/interfaces/domain/feedback.domain';

export type FeedbackQuestionsLoadData = {
  questions: QuestionMetric[];
  error: string | null;
};

export async function loadFeedbackQuestionsData(
  options?: FeedbackQuestionsOptions,
): Promise<FeedbackQuestionsLoadData> {
  try {
    const response = await ServiceGetFeedbackQuestions(options);

    return {
      questions: response.questions,
      error: null,
    };
  } catch (err) {
    console.error('Erro ao carregar métricas por pergunta:', err);

    return {
      questions: [],
      error: 'Erro ao carregar métricas por pergunta',
    };
  }
}
