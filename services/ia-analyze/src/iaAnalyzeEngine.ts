import { normalizeForComparison } from '../lib/normalizeForComparison.js';
import { createIaApiClient, IaApiClientError } from './iaApiClient.js';
import { canProcessAnalyzedItem } from './sentimentAnalysis.js';
import type {
  IaAnalyzeContext,
  IaAnalyzeFeedbackInput,
  IaAnalyzeRemoteFeedbackAnalysis,
  IaAnalyzeRemoteRunRequest,
  IaAnalyzeRemoteRunResponse,
} from '../../../shared/lib/interfaces/contracts/ia-analyze.contract.js';

/**
 * Erro de dominio do servico de IA com status HTTP e codigo tipado.
 * Serve para o endpoint retornar falhas de forma padronizada.
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

const STRUCTURED_ANSWER_LABELS = new Set<string>([
  'pessimo',
  'ruim',
  'mediana',
  'boa',
  'otima',
]);

const PORTUGUESE_STOPWORDS = new Set<string>([
  'a',
  'ao',
  'aos',
  'as',
  'com',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'na',
  'nas',
  'no',
  'nos',
  'o',
  'os',
  'para',
  'por',
  'que',
  'sem',
  'um',
  'uma',
]);

/**
 * Quebra texto em termos relevantes para validacao semantica.
 * Serve para cruzar termos da IA com o conteudo real da mensagem.
 */
function tokenizeRelevantWords(value: string) {
  return normalizeForComparison(value)
    .split(' ')
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 4 &&
        !PORTUGUESE_STOPWORDS.has(token) &&
        !STRUCTURED_ANSWER_LABELS.has(token),
    );
}

/**
 * Verifica se um termo da IA esta ancorado na mensagem original.
 * Serve para evitar categorias/keywords inventadas ou fora do contexto.
 */
function isGroundedInMessage(termNormalized: string, messageNormalized: string) {
  if (!termNormalized || !messageNormalized) {
    return false;
  }

  if (messageNormalized.includes(termNormalized)) {
    return true;
  }

  const termTokens = tokenizeRelevantWords(termNormalized);
  if (termTokens.length === 0) {
    return false;
  }

  const messageTokens = new Set(tokenizeRelevantWords(messageNormalized));

  return termTokens.some((token) => messageTokens.has(token));
}

/**
 * Gera fallback de keywords a partir da propria mensagem do cliente.
 * Serve para manter saida util quando a IA nao retorna termos aproveitaveis.
 */
function fallbackKeywordsFromMessage(message: string, maxCount: number) {
  const tokens = tokenizeRelevantWords(message);
  const unique = Array.from(new Set(tokens));
  return unique.slice(0, maxCount);
}

/**
 * Limpa, deduplica e limita termos com base em regras de negocio.
 * Serve para padronizar categories/keywords antes de persistir no gateway.
 */
function sanitizeTermList(params: {
  terms: string[];
  messageNormalized: string;
  forbiddenTerms: Set<string>;
  maxCount: number;
}) {
  const { terms, messageNormalized, forbiddenTerms, maxCount } = params;
  const result: string[] = [];
  const seen = new Set<string>();

  for (const value of terms) {
    const rawTerm = String(value ?? '').trim();
    if (!rawTerm) continue;

    const normalizedTerm = normalizeForComparison(rawTerm);
    if (!normalizedTerm) continue;
    if (forbiddenTerms.has(normalizedTerm)) continue;
    if (!isGroundedInMessage(normalizedTerm, messageNormalized)) continue;
    if (seen.has(normalizedTerm)) continue;

    seen.add(normalizedTerm);
    result.push(normalizedTerm);

    if (result.length >= maxCount) {
      break;
    }
  }

  return result;
}

/**
 * Sanitiza o resultado de analise de um unico feedback.
 * Serve para remover ruido de respostas dinamicas e reforcar rastreabilidade no texto.
 */
function sanitizeAnalysisTerms(params: {
  feedback: IaAnalyzeFeedbackInput;
  categories: string[];
  keywords: string[];
}) {
  const { feedback, categories, keywords } = params;

  const messageNormalized = normalizeForComparison(feedback.message ?? '');
  const forbiddenTerms = new Set<string>(STRUCTURED_ANSWER_LABELS);

  feedback.dynamic_answers.forEach((answer) => {
    const normalizedAnswerValue = normalizeForComparison(answer.answer_value);
    if (normalizedAnswerValue) {
      forbiddenTerms.add(normalizedAnswerValue);
    }

    const normalizedQuestion = normalizeForComparison(answer.question_text_snapshot);
    if (normalizedQuestion) {
      forbiddenTerms.add(normalizedQuestion);
    }
  });

  feedback.dynamic_subanswers.forEach((answer) => {
    const normalizedAnswerValue = normalizeForComparison(answer.answer_value);
    if (normalizedAnswerValue) {
      forbiddenTerms.add(normalizedAnswerValue);
    }

    const normalizedSubquestion = normalizeForComparison(
      answer.subquestion_text_snapshot,
    );
    if (normalizedSubquestion) {
      forbiddenTerms.add(normalizedSubquestion);
    }
  });

  let sanitizedKeywords = sanitizeTermList({
    terms: keywords,
    messageNormalized,
    forbiddenTerms,
    maxCount: 6,
  });

  if (sanitizedKeywords.length === 0) {
    sanitizedKeywords = fallbackKeywordsFromMessage(feedback.message ?? '', 4);
  }

  let sanitizedCategories = sanitizeTermList({
    terms: categories,
    messageNormalized,
    forbiddenTerms,
    maxCount: 4,
  });

  if (sanitizedCategories.length === 0) {
    sanitizedCategories = sanitizedKeywords.slice(0, 2);
  }

  return {
    categories: sanitizedCategories,
    keywords: sanitizedKeywords,
  };
}

/**
 * Executa a analise de IA para batches preparados pelo gateway.
 * Serve como nucleo do dominio ia-analyze sem qualquer acesso a banco de dados.
 */
export async function runIaAnalyzeEngine(
  request: IaAnalyzeRemoteRunRequest,
): Promise<IaAnalyzeRemoteRunResponse> {
  const batches = Array.isArray(request.batches) ? request.batches : [];

  if (batches.length === 0) {
    return {
      analyses: [],
      contexts: [],
    };
  }

  const apiKey = String(process.env.GEMINI_API_KEY ?? '').trim();
  if (!apiKey) {
    throw new IaAnalyzeServiceError(
      'Missing Gemini API key',
      500,
      'missing_gemini_api_key',
    );
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
        throw new IaAnalyzeServiceError(
          'Failed to call model API',
          502,
          'failed_ia_request',
        );
      }

      throw new IaAnalyzeServiceError(
        'Invalid AI response JSON',
        502,
        'invalid_ai_response',
      );
    }

    contexts.push({
      scope_type: batch.scope_type,
      catalog_item_id: batch.catalog_item_id,
      catalog_item_name: batch.catalog_item_name,
      analyzedCount: batch.feedbacks.length,
      globalInsights: parsed?.global_insights ?? null,
    });

    const feedbackById = new Map(batch.feedbacks.map((feedback) => [feedback.id, feedback]));
    const items = Array.isArray(parsed?.feedbacks) ? parsed.feedbacks : [];

    items.forEach((item) => {
      if (!canProcessAnalyzedItem({ item, feedbackById })) {
        return;
      }

      const sourceFeedback = feedbackById.get(item.feedback_id);
      if (!sourceFeedback) {
        return;
      }

      const sanitizedTerms = sanitizeAnalysisTerms({
        feedback: sourceFeedback,
        categories: Array.isArray(item.categories) ? item.categories : [],
        keywords: Array.isArray(item.keywords) ? item.keywords : [],
      });

      analysesByFeedbackId.set(item.feedback_id, {
        feedback_id: item.feedback_id,
        sentiment: item.sentiment,
        categories: sanitizedTerms.categories,
        keywords: sanitizedTerms.keywords,
      });
    });
  }

  return {
    analyses: Array.from(analysesByFeedbackId.values()),
    contexts,
  };
}
