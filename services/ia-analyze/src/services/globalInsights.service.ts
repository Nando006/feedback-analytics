import type { IaAnalyzeRemoteBatchInput } from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeContext } from '../../../../shared/interfaces/contracts/ia-analyze/analysis.contract.js';
import type { IaAnalyzeInsights } from '../../../../shared/interfaces/contracts/ia-analyze/analysis.contract.js';

/**
 * Monta o contexto de análise de um lote de feedbacks.
 *
 * - Recebe o lote (batch) e os insights globais (globalInsights)
 * - Retorna um objeto com informações essenciais do lote:
 *   tipo de escopo, id e nome do item analisado, quantidade de feedbacks e os insights globais (se houver)
 *
 * Facilita o transporte de dados resumidos para outras etapas da análise.
 */
export function buildBatchContext(
  batch: IaAnalyzeRemoteBatchInput,
  globalInsights: IaAnalyzeInsights | undefined | null,
): IaAnalyzeContext {
  return {
    scope_type: batch.scope_type,
    catalog_item_id: batch.catalog_item_id,
    catalog_item_name: batch.catalog_item_name,
    analyzedCount: batch.feedbacks.length,
    globalInsights: globalInsights ?? null,
  };
}
