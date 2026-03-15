import type {
  FeedbackAnalysisSummary,
  FeedbackInsightsReportOptions,
  FeedbackInsightsReport,
} from 'lib/interfaces/domain/feedback.domain';
import { ServiceGetFeedbackInsightsReport } from 'src/services/serviceFeedbacks';
import { loadFeedbackAnalysisData } from 'src/routes/load/loadFeedbackAnalysis';
import { ServiceGetCollectingDataEnterprise } from 'src/services/serviceEnterprise';

type InsightsCatalogItemOption = {
  id: string;
  name: string;
  kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
};

export type FeedbackInsightsReportLoadData = {
  report: FeedbackInsightsReport | null;
  summary: FeedbackAnalysisSummary | null;
  catalogItemOptions: InsightsCatalogItemOption[];
  error: string | null;
};

export async function loadFeedbackInsightsReportData(
  options?: FeedbackInsightsReportOptions,
): Promise<FeedbackInsightsReportLoadData> {
  const [reportData, analysisData, collectingData] = await Promise.all([
    ServiceGetFeedbackInsightsReport(options).catch(() => null),
    loadFeedbackAnalysisData({
      scope_type: options?.scope_type,
      catalog_item_id: options?.catalog_item_id,
    }),
    ServiceGetCollectingDataEnterprise().catch(() => null),
  ]);

  const catalogItemOptions: InsightsCatalogItemOption[] = [
    ...(collectingData?.catalog_products ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      kind: 'PRODUCT' as const,
    })),
    ...(collectingData?.catalog_services ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      kind: 'SERVICE' as const,
    })),
    ...(collectingData?.catalog_departments ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      kind: 'DEPARTMENT' as const,
    })),
  ];

  const hasError = reportData === null || analysisData.error !== null;

  return {
    report: reportData,
    summary: analysisData.summary,
    catalogItemOptions,
    error: hasError ? 'Erro ao carregar relatório de insights' : null,
  };
}
