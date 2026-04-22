import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import { ServiceGetCollectingDataEnterprise } from 'src/services/serviceEnterprise';

type InsightsCatalogItemOption = {
  id: string;
  name: string;
  kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
};

export type FeedbackInsightsReportLoadData = {
  availableScopes: ('COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT')[];
  catalogItemOptions: InsightsCatalogItemOption[];
  analysisGuard: {
    canAnalyze: boolean;
    message: string | null;
  };
};

function hasRequiredEnterpriseInfo(collecting: CollectingDataEnterprise | null) {
  if (!collecting) {
    return false;
  }

  const hasCompanyObjective = String(collecting.company_objective ?? '').trim().length > 0;
  const hasAnalyticsGoal = String(collecting.analytics_goal ?? '').trim().length > 0;
  const hasBusinessSummary = String(collecting.business_summary ?? '').trim().length > 0;

  return hasCompanyObjective && hasAnalyticsGoal && hasBusinessSummary;
}

export async function loadFeedbackInsightsReportData(): Promise<FeedbackInsightsReportLoadData> {
  const collectingData = await ServiceGetCollectingDataEnterprise().catch(() => null);
  const canAnalyze = hasRequiredEnterpriseInfo(collectingData);

  const availableScopes: ('COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT')[] = ['COMPANY'];
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

  return {
    availableScopes,
    catalogItemOptions,
    analysisGuard: {
      canAnalyze,
      message: canAnalyze
        ? null
        : 'Para analisar os feedbacks, preencha as informações da empresa em Editar > Configuração de Coleta de Dados.',
    },
  };
}