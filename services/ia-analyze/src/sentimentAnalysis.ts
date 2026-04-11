import type {
  IaAnalyzeFeedbackInput,
  IaAnalyzeRemoteFeedbackAnalysis,
  IaAnalyzeSentiment,
} from '../../../shared/lib/interfaces/contracts/ia-analyze.contract.js';

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
export function canProcessAnalyzedItem(params: {
  item: IaAnalyzeRemoteFeedbackAnalysis;
  feedbackById: Map<string, IaAnalyzeFeedbackInput>;
}): boolean {
  const { item, feedbackById } = params;

  return (
    typeof item.feedback_id === 'string' &&
    isValidSentiment(item.sentiment) &&
    feedbackById.has(item.feedback_id)
  );
}
