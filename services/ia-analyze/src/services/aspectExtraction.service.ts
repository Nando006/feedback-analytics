import { normalizeForComparison } from '../utils/normalizeForComparison.js';
import { buildForbiddenTerms, isGroundedInMessage } from '../lib/termProcessing.js';
import { isValidSentiment } from './sentimentAnalysis.service.js';
import type { IaAnalyzeFeedbackInput } from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type {
  AspectAnalysis,
} from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import type { IaAnalyzeSentiment } from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

const MAX_ASPECTS = 6;

/** Limita um número ao intervalo [-1, 1]; undefined se não for número válido. */
export function clampScore(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return Math.max(-1, Math.min(1, value));
}

/** Normaliza confiança para [0, 1]; undefined se não for número válido. */
export function normalizeConfidence(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(1, value));
}

/** Score padrão a partir da classe de sentimento (quando o modelo omite). */
export function scoreFromSentiment(sentiment: IaAnalyzeSentiment): number {
  if (sentiment === 'positive') return 0.6;
  if (sentiment === 'negative') return -0.6;
  return 0;
}

type RawAspect = {
  aspect?: unknown;
  sentiment?: unknown;
  sentiment_score?: unknown;
};

/**
 * Extrai aspectos (ABSA) do que a IA devolveu, reusando o mesmo saneamento de
 * categorias/keywords: cada rótulo precisa estar ancorado no `message`, não pode
 * ser termo proibido (rótulos de pergunta/Likert), é deduplicado e limitado.
 * Cada aspecto preserva seu `sentiment` (validado) e `sentiment_score` (clamp).
 */
export function extractAspects(
  feedback: IaAnalyzeFeedbackInput,
  rawAspects: unknown,
): AspectAnalysis[] {
  if (!Array.isArray(rawAspects)) return [];

  const messageNormalized = normalizeForComparison(feedback.message ?? '');
  const forbiddenTerms = buildForbiddenTerms(feedback);

  const result: AspectAnalysis[] = [];
  const seen = new Set<string>();

  for (const raw of rawAspects as RawAspect[]) {
    const label = String(raw?.aspect ?? '').trim();
    const sentiment = raw?.sentiment;
    if (!label || !isValidSentiment(sentiment)) continue;

    const normalized = normalizeForComparison(label);
    if (!normalized || forbiddenTerms.has(normalized) || seen.has(normalized)) continue;
    if (!isGroundedInMessage(normalized, messageNormalized)) continue;

    seen.add(normalized);

    const aspect: AspectAnalysis = { aspect: normalized, sentiment };
    const score = clampScore(raw?.sentiment_score);
    if (score !== undefined) aspect.sentiment_score = score;

    result.push(aspect);
    if (result.length >= MAX_ASPECTS) break;
  }

  return result;
}
