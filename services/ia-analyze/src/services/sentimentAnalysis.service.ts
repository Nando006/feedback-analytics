import type { IaAnalyzeSentiment } from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import type { CanProcessAnalyzedItemParams } from '../../types/sentimentAnalysis.types.js';

/**
 * Lista de sentimentos válidos para análise de feedback.
 *
 * Só esses valores são aceitos como resultado de sentimento.
 */
export const VALID_SENTIMENTS: IaAnalyzeSentiment[] = [
  'positive',
  'negative',
  'neutral',
];

/**
 * Set para busca rápida dos sentimentos válidos.
 */
const VALID_SENTIMENTS_SET = new Set(VALID_SENTIMENTS);

/**
 * Verifica se um valor é um sentimento válido.
 *
 * Retorna true se for uma string e estiver na lista de sentimentos aceitos.
 */
export function isValidSentiment(value: unknown): value is IaAnalyzeSentiment {
  return typeof value === 'string' && VALID_SENTIMENTS_SET.has(value as IaAnalyzeSentiment);
}

/**
 * Verifica se um item analisado pode ser processado.
 *
 * Só processa se:
 * - O feedback_id for string
 * - O sentimento for válido
 * - O feedback existir no mapa de feedbacks
 */
export function canProcessAnalyzedItem(params: CanProcessAnalyzedItemParams): boolean {
  const { item, feedbackById } = params;

  return (
    typeof item.feedback_id === 'string' &&
    isValidSentiment(item.sentiment) &&
    feedbackById.has(item.feedback_id)
  );
}
