import type {
  FeedbackAnalysisSummary,
  FeedbackInsightScopeType,
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
  availableScopes: FeedbackInsightScopeType[];
  catalogItemOptions: InsightsCatalogItemOption[];
  filters: {
    scope_type: FeedbackInsightScopeType;
    catalog_item_id: string | null;
  };
  error: string | null;
};

export async function loadFeedbackInsightsReportData(
  options?: FeedbackInsightsReportOptions,
): Promise<FeedbackInsightsReportLoadData> {
  const collectingData = await ServiceGetCollectingDataEnterprise().catch(() => null);

  const availableScopes: FeedbackInsightScopeType[] = ['COMPANY'];
  const catalogItemOptions: InsightsCatalogItemOption[] = [];

  const productItems = collectingData?.catalog_products ?? [];
  const serviceItems = collectingData?.catalog_services ?? [];
  const departmentItems = collectingData?.catalog_departments ?? [];

  if (collectingData?.uses_company_products && productItems.length > 0) {
    availableScopes.push('PRODUCT');
    catalogItemOptions.push(
      ...productItems.map((item) => ({
        id: item.id,
        name: item.name,
        kind: 'PRODUCT' as const,
      })),
    );
  }

  if (collectingData?.uses_company_services && serviceItems.length > 0) {
    availableScopes.push('SERVICE');
    catalogItemOptions.push(
      ...serviceItems.map((item) => ({
        id: item.id,
        name: item.name,
        kind: 'SERVICE' as const,
      })),
    );
  }

  if (collectingData?.uses_company_departments && departmentItems.length > 0) {
    availableScopes.push('DEPARTMENT');
    catalogItemOptions.push(
      ...departmentItems.map((item) => ({
        id: item.id,
        name: item.name,
        kind: 'DEPARTMENT' as const,
      })),
    );
  }

  const requestedScope = options?.scope_type ?? 'COMPANY';
  const scope_type = availableScopes.includes(requestedScope)
    ? requestedScope
    : 'COMPANY';

  let catalog_item_id: string | undefined;

  if (scope_type !== 'COMPANY') {
    const scopeItems = catalogItemOptions.filter((item) => item.kind === scope_type);
    const requestedItem = options?.catalog_item_id;

    catalog_item_id =
      requestedItem && scopeItems.some((item) => item.id === requestedItem)
        ? requestedItem
        : scopeItems[0]?.id;
  }

  const [reportData, analysisData] = await Promise.all([
    ServiceGetFeedbackInsightsReport({
      scope_type,
      catalog_item_id,
    }).catch(() => null),
    loadFeedbackAnalysisData({
      scope_type,
      catalog_item_id,
    }),
  ]);

  const hasError = reportData === null || analysisData.error !== null;

  return {
    report: reportData,
    summary: analysisData.summary,
    availableScopes,
    catalogItemOptions,
    filters: {
      scope_type,
      catalog_item_id: catalog_item_id ?? null,
    },
    error: hasError ? 'Erro ao carregar relatório de insights' : null,
  };
}
