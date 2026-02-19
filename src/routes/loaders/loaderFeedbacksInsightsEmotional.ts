import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackAnalysisData } from 'src/routes/load/loadFeedbackAnalysis';

export async function LoaderFeedbacksInsightsEmotional(
  _args: LoaderFunctionArgs,
) {
  void _args;
  const data = await loadFeedbackAnalysisData();

  return {
    ...data,
    error: data.error ? 'Erro ao carregar insights emocionais' : null,
  };
}
