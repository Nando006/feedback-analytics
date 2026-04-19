import { normalizeForComparison } from '../../lib/normalizeForComparison.js';
import {
  buildForbiddenTerms,
  sanitizeTermList,
  tokenizeRelevantWords,
} from '../../lib/termProcessing.js';
import type { IaAnalyzeFeedbackInput } from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';

/**
 * Gera palavras-chave de fallback a partir da própria mensagem.
 *
 * - Quebra a mensagem em palavras relevantes (usando tokenizeRelevantWords)
 * - Remove duplicatas
 * - Retorna até maxCount palavras
 *
 * Usado quando não há palavras-chave válidas extraídas.
 */
function fallbackKeywordsFromMessage(message: string, maxCount: number): string[] {
  const tokens = tokenizeRelevantWords(message);
  const unique = Array.from(new Set(tokens));
  return unique.slice(0, maxCount);
}

/**
 * Extrai as palavras-chave mais relevantes de um feedback.
 *
 * - Usa a lista bruta de palavras-chave sugeridas (rawKeywords)
 * - Normaliza, filtra proibidos e garante relação com a mensagem
 * - Limita a 6 palavras-chave
 * - Se não encontrar nenhuma válida, gera palavras-chave de fallback a partir da mensagem
 *
 * Garante que sempre haja pelo menos algumas palavras-chave úteis para análise.
 */
export function extractKeywords(
  feedback: IaAnalyzeFeedbackInput,
  rawKeywords: string[],
): string[] {
  const messageNormalized = normalizeForComparison(feedback.message ?? '');
  const forbiddenTerms = buildForbiddenTerms(feedback);

  const keywords = sanitizeTermList({
    terms: rawKeywords,
    messageNormalized,
    forbiddenTerms,
    maxCount: 6,
  });

  if (keywords.length === 0) {
    return fallbackKeywordsFromMessage(feedback.message ?? '', 4);
  }

  return keywords;
}
