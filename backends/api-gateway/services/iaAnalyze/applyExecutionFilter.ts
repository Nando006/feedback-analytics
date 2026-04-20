import { normalizeScopeType } from "./normalizeScopeType";
import type {
  IaAnalyzeFeedbackInput,
} from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type {
  IaAnalyzeRunRequest,
} from '../../../../shared/interfaces/contracts/ia-analyze/run.contract.js';

/**
 * Filtra a lista de feedbacks conforme o escopo e item de catálogo informados nas opções.
 *
 * - Se não houver filtro, retorna todos os feedbacks.
 * - Se escopo for 'COMPANY', retorna apenas feedbacks de empresa.
 * - Se escopo ou catalogItemId forem informados, filtra por esses critérios.
 * - Garante que só feedbacks relevantes para o contexto da análise sejam processados.
 *
 * Útil para evitar análises fora do contexto desejado (ex: só de um produto ou só da empresa).
 */
export function applyExecutionFilter(
  feedbacks: IaAnalyzeFeedbackInput[],
  options?: IaAnalyzeRunRequest,
) {
  const scope = options?.scope_type;
  const catalogItemId = options?.catalog_item_id?.trim();

  if (!scope && !catalogItemId) {
    return feedbacks;
  }

  return feedbacks.filter((feedback) => {
    const feedbackScope = normalizeScopeType(feedback.scope_type);
    const feedbackCatalogItemId = feedback.catalog_item?.id ?? null;

    if (scope === 'COMPANY') {
      return feedbackScope === 'COMPANY';
    }

    if (scope && feedbackScope !== scope) {
      return false;
    }

    if (catalogItemId) {
      return feedbackCatalogItemId === catalogItemId;
    }

    if (scope) {
      return feedbackScope === scope;
    }

    return feedbackCatalogItemId !== null;
  });
}