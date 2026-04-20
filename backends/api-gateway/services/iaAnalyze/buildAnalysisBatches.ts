import type {
  IaAnalyzeFeedbackInput,
} from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import { normalizeScopeType } from './normalizeScopeType.js';
import type { AnalysisBatch } from '../../types/iaAnalyze.types.js';
import type {
  IaAnalyzeRunRequest,
} from '../../../../shared/interfaces/contracts/ia-analyze/run.contract.js';

/**
 * Agrupa os feedbacks em lotes (batches) para análise IA, conforme escopo e item de catálogo.
 *
 * - Separa feedbacks da empresa (COMPANY) dos feedbacks de itens específicos (produtos, serviços, etc).
 * - Cada lote contém feedbacks do mesmo tipo e item, otimizando a análise por contexto.
 * - Permite filtrar por escopo e/ou item de catálogo, se informado nas opções.
 * - Retorna um array de batches prontos para serem enviados à IA.
 *
 * Útil para garantir que cada análise IA receba apenas feedbacks do mesmo contexto, evitando mistura de dados.
 */
export function buildAnalysisBatches(
  feedbacks: IaAnalyzeFeedbackInput[],
  options?: IaAnalyzeRunRequest,
): AnalysisBatch[] {
  const scope = options?.scope_type;
  const catalogItemId = options?.catalog_item_id?.trim();

  const companyFeedbacks = feedbacks.filter((feedback) =>
    normalizeScopeType(feedback.scope_type) === 'COMPANY',
  );

  const itemBuckets = new Map<string, AnalysisBatch>();

  feedbacks.forEach((feedback) => {
    const feedbackScope = normalizeScopeType(feedback.scope_type);
    const item = feedback.catalog_item;

    if (feedbackScope === 'COMPANY' || !item?.id) {
      return;
    }

    const key = `${feedbackScope}:${item.id}`;
    const current = itemBuckets.get(key);

    if (!current) {
      itemBuckets.set(key, {
        scopeType: feedbackScope,
        catalogItemId: item.id,
        catalogItemName: item.name,
        feedbacks: [feedback],
      });
      return;
    }

    current.feedbacks.push(feedback);
  });

  const itemBatches = Array.from(itemBuckets.values());

  if (scope === 'COMPANY') {
    return companyFeedbacks.length > 0
      ? [
          {
            scopeType: 'COMPANY',
            catalogItemId: null,
            catalogItemName: null,
            feedbacks: companyFeedbacks,
          },
        ]
      : [];
  }

  if (scope) {
    const filteredByScope = itemBatches.filter((batch) => batch.scopeType === scope);

    if (catalogItemId) {
      return filteredByScope.filter((batch) => batch.catalogItemId === catalogItemId);
    }

    return filteredByScope;
  }

  if (catalogItemId) {
    return itemBatches.filter((batch) => batch.catalogItemId === catalogItemId);
  }

  const batches: AnalysisBatch[] = [];

  if (companyFeedbacks.length > 0) {
    batches.push({
      scopeType: 'COMPANY',
      catalogItemId: null,
      catalogItemName: null,
      feedbacks: companyFeedbacks,
    });
  }

  batches.push(...itemBatches);

  return batches;
}