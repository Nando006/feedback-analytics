import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackAnalysisData } from 'src/routes/load/loadFeedbackAnalysis';

export async function LoaderFeedbacksAnalyticsPositive(
  _args: LoaderFunctionArgs,
) {
  void _args;
  const data = await loadFeedbackAnalysisData({ sentiment: 'positive' });

  return {
    ...data,
    error: data.error ? 'Erro ao carregar analytics de feedbacks positivos' : null,
  };
}
