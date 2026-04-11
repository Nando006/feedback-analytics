import { GoogleGenAI } from '@google/genai';
import { buildIaPromptByScope } from './iaAnalyzePromptBuilders.js';
import type {
  IaAnalyzeContext,
  IaAnalyzeFeedbackInput,
  IaAnalyzeInsights,
  IaAnalyzeRemoteFeedbackAnalysis,
  IaAnalyzeRemoteRunRequest,
  IaAnalyzeRemoteRunResponse,
  IaAnalyzeSentiment,
} from '../../../../shared/lib/interfaces/contracts/ia-analyze.contract.js';

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

function extractJsonFromText(raw: string): string {
  let text = raw.trim();

  if (text.startsWith('```')) {
    const firstLineEnd = text.indexOf('\n');
    if (firstLineEnd !== -1) {
      text = text.slice(firstLineEnd + 1);
      const lastFenceIndex = text.lastIndexOf('```');
      if (lastFenceIndex !== -1) {
        text = text.slice(0, lastFenceIndex);
      }
      text = text.trim();
    }
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  return text;
}

function normalizeForComparison(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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

function fallbackKeywordsFromMessage(message: string, maxCount: number) {
  const tokens = tokenizeRelevantWords(message);
  const unique = Array.from(new Set(tokens));
  return unique.slice(0, maxCount);
}

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

type ParsedIaResponse = {
  feedbacks?: IaAnalyzeRemoteFeedbackAnalysis[];
  global_insights?: IaAnalyzeInsights;
};

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

  const ai = new GoogleGenAI({ apiKey });
  const validSentiments: IaAnalyzeSentiment[] = ['positive', 'negative', 'neutral'];
  const validSentimentsSet = new Set(validSentiments);

  const analysesByFeedbackId = new Map<string, IaAnalyzeRemoteFeedbackAnalysis>();
  const contexts: IaAnalyzeContext[] = [];

  for (const batch of batches) {
    if (!Array.isArray(batch.feedbacks) || batch.feedbacks.length === 0) {
      continue;
    }

    const prompt = buildIaPromptByScope({
      scopeType: batch.scope_type,
      enterpriseContext: request.enterprise_context,
      feedbacks: batch.feedbacks,
    });

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    type AiResponseShape = {
      text?: string | (() => string);
    };

    const maybeText = (aiResponse as AiResponseShape).text;
    const rawText = (typeof maybeText === 'function' ? maybeText() : maybeText) ?? '';

    let parsed: ParsedIaResponse | null = null;

    try {
      const jsonString = extractJsonFromText(rawText);
      parsed = JSON.parse(jsonString) as ParsedIaResponse;
    } catch {
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
      if (
        typeof item.feedback_id !== 'string' ||
        !validSentimentsSet.has(item.sentiment) ||
        !feedbackById.has(item.feedback_id)
      ) {
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
