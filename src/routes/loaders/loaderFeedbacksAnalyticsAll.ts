import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackAnalysisData } from 'src/routes/load/loadFeedbackAnalysis';

export async function LoaderFeedbacksAnalyticsAll(_args: LoaderFunctionArgs) {
  void _args;
  return await loadFeedbackAnalysisData();
}
