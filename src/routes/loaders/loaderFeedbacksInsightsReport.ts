import type { LoaderFunctionArgs } from 'react-router-dom';
import { loadFeedbackInsightsReportData } from 'src/routes/load/loadFeedbackInsightsReport';
import type { IaStudioScopeType } from 'lib/interfaces/contracts/ia-studio.contract';

function parseScopeType(value: string | null): IaStudioScopeType | undefined {
  const normalized = String(value ?? '').trim().toUpperCase();

  if (
    normalized === 'COMPANY' ||
    normalized === 'PRODUCT' ||
    normalized === 'SERVICE' ||
    normalized === 'DEPARTMENT'
  ) {
    return normalized;
  }

  return undefined;
}

export async function LoaderFeedbacksInsightsReport({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const scope_type = parseScopeType(url.searchParams.get('scope_type')) ?? 'COMPANY';
  const catalog_item_id = String(url.searchParams.get('catalog_item_id') ?? '').trim() || undefined;

  return await loadFeedbackInsightsReportData({
    scope_type,
    catalog_item_id,
  });
}