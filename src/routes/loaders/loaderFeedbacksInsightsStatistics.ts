import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackAnalysisData } from 'src/routes/load/loadFeedbackAnalysis';

export async function LoaderFeedbacksInsightsStatistics(
  _args: LoaderFunctionArgs,
) {
  void _args;
  const data = await loadFeedbackAnalysisData();

  return {
    ...data,
    error: data.error
      ? 'Erro ao carregar estatísticas de insights'
      : null,
  };
}
