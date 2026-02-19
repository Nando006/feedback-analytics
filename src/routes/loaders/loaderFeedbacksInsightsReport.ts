import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackInsightsReportData } from 'src/routes/load/loadFeedbackInsightsReport';

export async function LoaderFeedbacksInsightsReport(_args: LoaderFunctionArgs) {
  void _args;
  return await loadFeedbackInsightsReportData();
}
