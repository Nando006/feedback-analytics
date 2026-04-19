import { createIaApiClient, IaApiClientError } from '../clients/gemini.client.js';
import { canProcessAnalyzedItem } from './sentimentAnalysis.service.js';
import { extractKeywords } from './keywordExtraction.service.js';
import { extractCategories } from './categorization.service.js';
import { buildBatchContext } from './globalInsights.service.js';
import type {
  IaAnalyzeRemoteFeedbackAnalysis,
  IaAnalyzeRemoteRunRequest,
  IaAnalyzeRemoteRunResponse,
} from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import type { IaAnalyzeFeedbackInput } from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeContext } from '../../../../shared/interfaces/contracts/ia-analyze/analysis.contract.js';

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

/**
 * Função principal que executa o fluxo de análise de feedbacks por IA.
 *
 * - Recebe uma requisição com lotes de feedbacks.
 * - Para cada lote, chama o modelo de IA para analisar os feedbacks.
 * - Extrai e organiza sentimentos, categorias e palavras-chave de cada feedback.
 * - Monta o contexto de análise de cada lote.
 * - Retorna o resultado consolidado com todas as análises e contextos.
 *
 * Lança erros customizados em caso de falha de API ou resposta inválida.
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

  for (const batch of batches) {
    if (!Array.isArray(batch.feedbacks) || batch.feedbacks.length === 0) {
      continue;
    }

    let parsed: Awaited<ReturnType<typeof iaApiClient.analyzeBatch>>;

    try {
      parsed = await iaApiClient.analyzeBatch({
        scopeType: batch.scope_type,
        enterpriseContext: request.enterprise_context,
        feedbacks: batch.feedbacks,
      });
    } catch (error) {
      if (error instanceof IaApiClientError && error.code === 'failed_ia_request') {
        throw new IaAnalyzeServiceError('Failed to call model API', 502, 'failed_ia_request');
      }

      throw new IaAnalyzeServiceError('Invalid AI response JSON', 502, 'invalid_ai_response');
    }

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
      const categories = extractCategories(sourceFeedback, rawCategories, keywords);

      analysesByFeedbackId.set(item.feedback_id, {
        feedback_id: item.feedback_id,
        sentiment: item.sentiment,
        categories,
        keywords,
      });
    });
  }

  return {
    analyses: Array.from(analysesByFeedbackId.values()),
    contexts,
  };
}
