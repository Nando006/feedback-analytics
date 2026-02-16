import type {
  FeedbackAnalysisSummary,
  FeedbackInsightsReport,
} from 'lib/interfaces/user/feedback';
import { ServiceGetFeedbackInsightsReport } from 'src/services/serviceFeedbacks';
import { loadFeedbackAnalysisData } from 'src/routes/load/loadFeedbackAnalysis';

export type FeedbackInsightsReportLoadData = {
  report: FeedbackInsightsReport | null;
  summary: FeedbackAnalysisSummary | null;
  error: string | null;
};

export async function loadFeedbackInsightsReportData(): Promise<FeedbackInsightsReportLoadData> {
  const [reportData, analysisData] = await Promise.all([
    ServiceGetFeedbackInsightsReport().catch(() => null),
    loadFeedbackAnalysisData(),
  ]);

  const hasError = reportData === null || analysisData.error !== null;

  return {
    report: reportData,
    summary: analysisData.summary,
    error: hasError ? 'Erro ao carregar relatório de insights' : null,
  };
}
