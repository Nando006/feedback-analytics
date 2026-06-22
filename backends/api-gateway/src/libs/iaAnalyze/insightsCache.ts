import type { IaAnalyzeFeedbackInput } from '../../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeContext } from '../../../../../shared/interfaces/contracts/ia-analyze/analysis.contract.js';
import type { IaAnalyzeScopeType } from '../../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

/**
 * Subconjunto de `feedback_insights_report` usado pelo cache de leitura da
 * regeneração de insights. Reconstruímos o contexto a partir daqui quando não há
 * feedback analisado novo desde a última geração — evitando reprocessar no LLM.
 */
export interface SavedInsightsReport {
  scope_type: IaAnalyzeScopeType;
  catalog_item_id: string | null;
  catalog_item_name: string | null;
  summary: string | null;
  recommendations: string[] | null;
  updated_at: string | null;
}

/** Chave de agrupamento por escopo (scope_type + item de catálogo). */
export function scopeKey(scopeType: IaAnalyzeScopeType, catalogItemId: string | null): string {
  return `${scopeType}:${catalogItemId ?? ''}`;
}

/**
 * Conta feedbacks analisados por escopo. Serve para preencher o `analyzedCount`
 * dos contextos reconstruídos a partir do cache (o relatório salvo não guarda a
 * contagem).
 */
export function countAnalyzedByScope(
  feedbacks: IaAnalyzeFeedbackInput[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const feedback of feedbacks) {
    const key = scopeKey(feedback.scope_type, feedback.catalog_item?.id ?? null);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Decide se o cache está OBSOLETO (precisa regenerar): `true` quando há algum
 * feedback analisado mais novo que o relatório mais antigo entre os relevantes,
 * ou quando não há relatório salvo. Conservador: se as datas não puderem ser
 * determinadas, considera obsoleto — nunca serve um relatório potencialmente
 * velho.
 */
export function hasFeedbackNewerThanReports(
  feedbacks: IaAnalyzeFeedbackInput[],
  reports: SavedInsightsReport[],
): boolean {
  if (reports.length === 0) {
    return true; // sem relatório salvo: não há o que servir do cache.
  }

  const latestFeedbackMs = feedbacks.reduce((max, feedback) => {
    const time = feedback.created_at ? new Date(feedback.created_at).getTime() : NaN;
    return Number.isFinite(time) && time > max ? time : max;
  }, Number.NEGATIVE_INFINITY);

  if (!Number.isFinite(latestFeedbackMs)) {
    return true; // sem data confiável de feedback: regenerar por segurança.
  }

  const oldestReportMs = reports.reduce((min, report) => {
    const time = report.updated_at ? new Date(report.updated_at).getTime() : NaN;
    return Number.isFinite(time) && time < min ? time : min;
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(oldestReportMs)) {
    return true; // relatório sem updated_at confiável: regenerar.
  }

  return latestFeedbackMs > oldestReportMs;
}

/** Reconstrói um `IaAnalyzeContext` a partir de um relatório salvo (cache hit). */
export function reportRowToContext(
  report: SavedInsightsReport,
  analyzedCount: number,
): IaAnalyzeContext {
  return {
    scope_type: report.scope_type,
    catalog_item_id: report.catalog_item_id,
    catalog_item_name: report.catalog_item_name,
    analyzedCount,
    globalInsights: {
      summary: report.summary ?? undefined,
      recommendations: report.recommendations ?? undefined,
    },
  };
}
