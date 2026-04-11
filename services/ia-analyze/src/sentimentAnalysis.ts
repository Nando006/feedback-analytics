/**
 * Utilitarios de sentimento para o dominio ia-analyze.
 * Define os sentimentos validos e as regras minimas para aceitar
 * itens retornados pela IA antes do processamento no engine.
 */

import type {
  IaAnalyzeSentiment,
} from '../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import type { CanProcessAnalyzedItemParams } from '../types/sentimentAnalysis.types.js';

export const VALID_SENTIMENTS: IaAnalyzeSentiment[] = [
  'positive',
  'negative',
  'neutral',
];

const VALID_SENTIMENTS_SET = new Set(VALID_SENTIMENTS);

/**
 * Valida se um valor pertence ao conjunto de sentimentos suportados.
 * Serve para impedir que sentimentos fora do contrato avancem no fluxo.
 */
export function isValidSentiment(value: unknown): value is IaAnalyzeSentiment {
  return typeof value === 'string' && VALID_SENTIMENTS_SET.has(value as IaAnalyzeSentiment);
}

/**
 * Valida se um item retornado pela IA esta apto para processamento.
 * Serve para garantir referencia de feedback valida e sentimento tipado.
 */
export function canProcessAnalyzedItem(params: CanProcessAnalyzedItemParams): boolean {
  const { item, feedbackById } = params;

  return (
    typeof item.feedback_id === 'string' &&
    isValidSentiment(item.sentiment) &&
    feedbackById.has(item.feedback_id)
  );
}
