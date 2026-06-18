import { createIaApiClient, IaApiClientError } from '../providers/gemini.provider.js';
import { canProcessAnalyzedItem } from './sentimentAnalysis.service.js';
import { extractKeywords } from './keywordExtraction.service.js';
import { extractCategories } from './categorization.service.js';
import {
  extractAspects,
  clampScore,
  normalizeConfidence,
  scoreFromSentiment,
} from './aspectExtraction.service.js';
import { buildBatchContext } from './globalInsights.service.js';
import type {
  IaAnalyzeRemoteFeedbackAnalysis,
  IaAnalyzeRemoteRunRequest,
  IaAnalyzeRemoteRunResponse,
} from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import type {
  IaAnalyzeFeedbackInput,
  IaAnalyzeRemoteBatchInput,
} from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeContext } from '../../../../shared/interfaces/contracts/ia-analyze/analysis.contract.js';
import type { ParsedIaResponse } from '../../types/iaApiClient.types.js';

/**
 * Classe de erro customizada para o serviço de análise IA.
 *
 * Permite lançar erros com status HTTP e código específico,
 * facilitando o tratamento e depuração de falhas no serviço.
 */
export class IaAnalyzeServiceError extends Error {
  public statusCode: number;

  public code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const DEFAULT_GEMINI_CONCURRENCY = 3;

/**
 * Quantas chamadas ao Gemini podem estar em voo ao mesmo tempo (configurável via
 * IA_GEMINI_CONCURRENCY). Com os lotes fatiados por tamanho, o número de chamadas
 * cresce — limitar a concorrência evita estourar o rate limit do Gemini (→ 429).
 */
function readGeminiConcurrency(): number {
  const parsed = Number(String(process.env.IA_GEMINI_CONCURRENCY ?? '').trim());
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }
  return DEFAULT_GEMINI_CONCURRENCY;
}

/**
 * Executa `task` sobre cada item com no máximo `limit` chamadas em paralelo
 * (semáforo simples), preservando a ordem dos resultados. Substitui o
 * `Promise.all` sem limite, que disparava todas as chamadas ao Gemini de uma vez.
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const worker = async (): Promise<void> => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await task(items[index], index);
    }
  };

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

/** Resultado de processar um lote: concluído, vazio (ignorado) ou falho. */
type BatchOutcome =
  | { status: 'done'; batch: IaAnalyzeRemoteBatchInput; parsed: ParsedIaResponse }
  | { status: 'empty' }
  | { status: 'failed'; error: unknown };

/**
 * Função principal que executa o fluxo de análise de feedbacks por IA.
 *
 * - Recebe uma requisição com lotes de feedbacks.
 * - Para cada lote, chama o modelo de IA com CONCORRÊNCIA LIMITADA (não dispara
 *   todas de uma vez), evitando rate limit.
 * - Extrai e organiza sentimentos, categorias e palavras-chave de cada feedback.
 * - Monta o contexto de análise de cada lote.
 * - Retorna o resultado consolidado com todas as análises e contextos.
 *
 * É RESILIENTE: um lote que falha não derruba os demais (sucesso parcial). Só
 * lança erro se TODOS os lotes com conteúdo falharem.
 */
export async function runIaAnalyzeService(
  request: IaAnalyzeRemoteRunRequest,
): Promise<IaAnalyzeRemoteRunResponse> {
  const batches = Array.isArray(request.batches) ? request.batches : [];

  if (batches.length === 0) {
    return { analyses: [], contexts: [] };
  }

  const apiKey = String(process.env.GEMINI_API_KEY ?? '').trim();
  if (!apiKey) {
    throw new IaAnalyzeServiceError('Missing Gemini API key', 500, 'missing_gemini_api_key');
  }

  const iaApiClient = createIaApiClient(apiKey);
  const analysesByFeedbackId = new Map<string, IaAnalyzeRemoteFeedbackAnalysis>();
  const contexts: IaAnalyzeContext[] = [];

  const concurrency = readGeminiConcurrency();

  const outcomes = await mapWithConcurrency(
    batches,
    concurrency,
    async (batch): Promise<BatchOutcome> => {
      if (!Array.isArray(batch.feedbacks) || batch.feedbacks.length === 0) {
        return { status: 'empty' };
      }

      try {
        const parsed = await iaApiClient.analyzeBatch({
          scopeType: batch.scope_type,
          enterpriseContext: request.enterprise_context,
          feedbacks: batch.feedbacks,
        });
        return { status: 'done', batch, parsed };
      } catch (error) {
        console.error(
          `[ia-analyze] lote falhou (scope=${batch.scope_type}, item=${batch.catalog_item_id ?? 'null'}):`,
          error,
        );
        return { status: 'failed', error };
      }
    },
  );

  const succeeded = outcomes.filter(
    (outcome): outcome is Extract<BatchOutcome, { status: 'done' }> => outcome.status === 'done',
  );
  const failed = outcomes.filter(
    (outcome): outcome is Extract<BatchOutcome, { status: 'failed' }> => outcome.status === 'failed',
  );
  const nonEmptyBatchCount = batches.filter(
    (batch) => Array.isArray(batch.feedbacks) && batch.feedbacks.length > 0,
  ).length;

  // Se TODOS os lotes com conteúdo falharam, propaga o erro (não devolve vazio
  // silencioso). Se ao menos um deu certo, segue com sucesso PARCIAL: os lotes
  // que falharam ficam de fora e podem ser reprocessados numa próxima execução.
  if (nonEmptyBatchCount > 0 && succeeded.length === 0) {
    const firstError = failed[0]?.error;
    // Agrega os códigos de falha de TODOS os lotes antes de propagar: assim o log
    // de produção distingue 'failed_ia_request' (Gemini 429/503/timeout) de
    // 'invalid_ai_response' (MAX_TOKENS / JSON inválido) sem precisar reproduzir.
    const failureCodes = failed.map((outcome) =>
      outcome.error instanceof IaApiClientError ? outcome.error.code : 'unknown',
    );
    console.error(
      `[ia-analyze] todos os ${nonEmptyBatchCount} lote(s) com conteúdo falharam — códigos: ${failureCodes.join(', ')}`,
    );

    if (firstError instanceof IaApiClientError && firstError.code === 'failed_ia_request') {
      throw new IaAnalyzeServiceError('Failed to call model API', 502, 'failed_ia_request');
    }
    throw new IaAnalyzeServiceError('Invalid AI response JSON', 502, 'invalid_ai_response');
  }

  for (const result of succeeded) {
    const { batch, parsed } = result;

    contexts.push(buildBatchContext(batch, parsed?.global_insights));

    const feedbackById = new Map<string, IaAnalyzeFeedbackInput>(
      batch.feedbacks.map((feedback): [string, IaAnalyzeFeedbackInput] => [feedback.id, feedback]),
    );

    const items = Array.isArray(parsed?.feedbacks) ? parsed.feedbacks : [];

    items.forEach((item) => {
      if (!canProcessAnalyzedItem({ item, feedbackById })) return;

      const sourceFeedback = feedbackById.get(item.feedback_id);
      if (!sourceFeedback) return;

      const rawKeywords = Array.isArray(item.keywords) ? item.keywords : [];
      const rawCategories = Array.isArray(item.categories) ? item.categories : [];

      const keywords = extractKeywords(sourceFeedback, rawKeywords);
      const categories = extractCategories(sourceFeedback, rawCategories, keywords, batch.scope_type);
      const aspects = extractAspects(sourceFeedback, item.aspects);
      const sentiment_score =
        clampScore(item.sentiment_score) ?? scoreFromSentiment(item.sentiment);
      const confidence = normalizeConfidence(item.confidence);

      analysesByFeedbackId.set(item.feedback_id, {
        feedback_id: item.feedback_id,
        sentiment: item.sentiment,
        categories,
        keywords,
        sentiment_score,
        confidence,
        aspects,
      });
    });
  }

  return {
    analyses: Array.from(analysesByFeedbackId.values()),
    contexts,
  };
}
