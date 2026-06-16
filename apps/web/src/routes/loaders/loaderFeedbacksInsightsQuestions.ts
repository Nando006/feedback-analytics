import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackQuestionsData } from 'src/routes/load/loadFeedbackQuestions';

export async function LoaderFeedbacksInsightsQuestions(
  _args: LoaderFunctionArgs,
) {
  void _args;
  const data = await loadFeedbackQuestionsData();

  return {
    ...data,
    error: data.error ? 'Erro ao carregar métricas por pergunta' : null,
  };
}
