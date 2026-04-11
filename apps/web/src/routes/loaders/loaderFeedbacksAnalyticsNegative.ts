import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackAnalysisData } from 'src/routes/load/loadFeedbackAnalysis';

export async function LoaderFeedbacksAnalyticsNegative(
  _args: LoaderFunctionArgs,
) {
  void _args;
  const data = await loadFeedbackAnalysisData({ sentiment: 'negative' });

  return {
    ...data,
    error: data.error ? 'Erro ao carregar analytics de feedbacks negativos' : null,
  };
}
