import { GoogleGenAI } from '@google/genai';
import { buildIaPromptByScope } from '../lib/iaAnalyzePromptBuilders.js';
import { extractJsonFromText } from '../utils/extractJsonFromText.js';
import type {
  AiResponseShape,
  AnalyzeBatchWithIaParams,
  IaApiClient,
  IaApiClientErrorCode,
  ParsedIaResponse,
} from '../../types/iaApiClient.types.js';

/**
 * Teto de tokens de SAÍDA por chamada. Com os lotes já fatiados por tamanho no
 * gateway (IA_MAX_FEEDBACKS_PER_BATCH), a saída esperada é pequena; este teto é
 * folgado e serve de trava. Bem abaixo do máximo do modelo (65.536).
 */
const MAX_OUTPUT_TOKENS = 16_384;

// Política de retry para falhas transitórias do Gemini (429 rate limit, 503
// overloaded, 5xx). Falhas não-transitórias (400, 401, 404) não são retentadas.
const MAX_ATTEMPTS = 4;
const BASE_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 20_000;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

/**
 * Classe de erro customizada para falhas do cliente de IA.
 *
 * Permite lançar erros com código específico para identificar o tipo de problema
 * ocorrido ao chamar ou processar a resposta do modelo de IA.
 */
export class IaApiClientError extends Error {
  public code: IaApiClientErrorCode;

  constructor(message: string, code: IaApiClientErrorCode) {
    super(message);
    this.code = code;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Extrai o status HTTP do erro do SDK (varia entre .status numérico e a mensagem). */
function getErrorStatus(error: unknown): number | null {
  if (error && typeof error === 'object') {
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number') return status;
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'number') return code;
  }
  return null;
}

/** Decide se vale a pena retentar: rate limit / overload / 5xx são transitórios. */
function isRetryableError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status !== null) {
    return RETRYABLE_STATUS.has(status);
  }

  const message = String((error as { message?: unknown })?.message ?? '').toLowerCase();
  return (
    message.includes('resource_exhausted') ||
    message.includes('unavailable') ||
    message.includes('overloaded') ||
    message.includes('rate limit') ||
    message.includes('429') ||
    message.includes('503')
  );
}

/** Honra o retryDelay sugerido pelo Gemini (google.rpc.RetryInfo), se presente na mensagem. */
function parseSuggestedDelayMs(error: unknown): number | null {
  const message = String((error as { message?: unknown })?.message ?? '');
  const match =
    message.match(/retrydelay["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)s/i) ??
    message.match(/retry\s+(?:after|in)\s+(\d+(?:\.\d+)?)\s*s/i);

  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1_000);
  }
  return null;
}

/** Backoff exponencial com jitter, limitado a MAX_BACKOFF_MS. */
function backoffDelayMs(attempt: number): number {
  const exponential = Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);
  const jitter = Math.floor(Math.random() * 500);
  return exponential + jitter;
}

/**
 * Cria um cliente de IA com API key fixa para a execucao atual.
 * Serve para reutilizar a conexao com o modelo ao longo dos batches.
 */
export function createIaApiClient(apiKey: string): IaApiClient {
  const ai = new GoogleGenAI({ apiKey });

  return {
    /**
     * Envia um batch para o modelo e devolve a resposta parseada em JSON.
     * Encapsula prompt, chamada do modelo (com retry/backoff em falhas
     * transitórias e teto de saída) e parser num único ponto. Saída truncada
     * (finishReason MAX_TOKENS) é tratada como resposta inválida, não parseada.
     */
    async analyzeBatch(params: AnalyzeBatchWithIaParams): Promise<ParsedIaResponse> {
      const prompt = buildIaPromptByScope({
        scopeType: params.scopeType,
        enterpriseContext: params.enterpriseContext,
        feedbacks: params.feedbacks,
      });

      let aiResponse: AiResponseShape | null = null;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          aiResponse = (await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              thinkingConfig: { thinkingBudget: 0 },
              maxOutputTokens: MAX_OUTPUT_TOKENS,
            },
          })) as AiResponseShape;
          break;
        } catch (error) {
          if (attempt < MAX_ATTEMPTS && isRetryableError(error)) {
            const delay = Math.min(
              parseSuggestedDelayMs(error) ?? backoffDelayMs(attempt),
              MAX_BACKOFF_MS,
            );
            await sleep(delay);
            continue;
          }

          throw new IaApiClientError('Failed to call model API', 'failed_ia_request');
        }
      }

      if (!aiResponse) {
        throw new IaApiClientError('Failed to call model API', 'failed_ia_request');
      }

      // Saída cortada por limite de tokens => JSON incompleto. Não tentar parsear.
      const finishReason = aiResponse.candidates?.[0]?.finishReason;
      if (finishReason === 'MAX_TOKENS') {
        throw new IaApiClientError(
          'AI response truncated (MAX_TOKENS)',
          'invalid_ai_response',
        );
      }

      const maybeText = aiResponse.text;
      const rawText = (typeof maybeText === 'function' ? maybeText() : maybeText) ?? '';

      try {
        const jsonString = extractJsonFromText(rawText);
        return JSON.parse(jsonString) as ParsedIaResponse;
      } catch {
        throw new IaApiClientError('Invalid AI response JSON', 'invalid_ai_response');
      }
    },
  };
}
