import type {
  FeedbackAnswerValue,
  FeedbackQuestionAnswerInput,
  FeedbackSubquestionAnswerInput,
} from 'lib/interfaces/contracts/qrcode.contract';
import { REQUIRED_QUESTION_COUNT } from './publicQrFeedbackForm';

export const MAX_SUBANSWER_COUNT = 9;

export const PUBLIC_QR_FEEDBACK_ERRORS = {
  missingEnterpriseId: 'ID da empresa não encontrado. Verifique o QR Code.',
  missingRating: 'Por favor, selecione uma avaliação.',
  missingMessage: 'Por favor, escreva seu feedback.',
  questionsNotConfigured:
    'Perguntas de feedback ainda não configuradas para este QR Code.',
  missingAnswers: `Responda as ${REQUIRED_QUESTION_COUNT} perguntas antes de enviar.`,
  missingSubanswers: 'Responda todas as subperguntas antes de enviar.',
} as const;

export const ALLOWED_ANSWER_VALUES: FeedbackAnswerValue[] = [
  'PESSIMO',
  'RUIM',
  'MEDIANA',
  'BOA',
  'OTIMA',
];

type PublicQrFeedbackBaseValidationInput = {
  enterprise_id: string;
  rating: number;
  message: string;
};

function normalizeAnswerValue(value: unknown) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function normalizeEntityId(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getPublicQrFeedbackBaseValidationError({
  enterprise_id,
  rating,
  message,
}: PublicQrFeedbackBaseValidationInput): string | null {
  if (!enterprise_id.trim()) {
    return PUBLIC_QR_FEEDBACK_ERRORS.missingEnterpriseId;
  }

  if (!rating) {
    return PUBLIC_QR_FEEDBACK_ERRORS.missingRating;
  }

  if (!message.trim()) {
    return PUBLIC_QR_FEEDBACK_ERRORS.missingMessage;
  }

  return null;
}

export function parsePublicQrAnswersInput(
  raw: string,
): FeedbackQuestionAnswerInput[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== REQUIRED_QUESTION_COUNT) {
      return null;
    }

    const normalized = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const candidate = item as {
          question_id?: unknown;
          answer_value?: unknown;
        };

        const questionId = normalizeEntityId(candidate.question_id);
        const answerValue = normalizeAnswerValue(candidate.answer_value);

        if (
          !questionId ||
          !ALLOWED_ANSWER_VALUES.includes(answerValue as FeedbackAnswerValue)
        ) {
          return null;
        }

        return {
          question_id: questionId,
          answer_value: answerValue as FeedbackAnswerValue,
        };
      })
      .filter(
        (entry): entry is FeedbackQuestionAnswerInput =>
          Boolean(entry?.question_id) && Boolean(entry?.answer_value),
      );

    if (normalized.length !== REQUIRED_QUESTION_COUNT) {
      return null;
    }

    const questionIds = normalized.map((entry) => entry.question_id);
    if (new Set(questionIds).size !== REQUIRED_QUESTION_COUNT) {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}

export function parsePublicQrSubanswersInput(
  raw: string,
): FeedbackSubquestionAnswerInput[] | null {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    if (parsed.length > MAX_SUBANSWER_COUNT) {
      return null;
    }

    const normalized = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const candidate = item as {
          subquestion_id?: unknown;
          answer_value?: unknown;
        };

        const subquestionId = normalizeEntityId(candidate.subquestion_id);
        const answerValue = normalizeAnswerValue(candidate.answer_value);

        if (
          !subquestionId ||
          !ALLOWED_ANSWER_VALUES.includes(answerValue as FeedbackAnswerValue)
        ) {
          return null;
        }

        return {
          subquestion_id: subquestionId,
          answer_value: answerValue as FeedbackAnswerValue,
        };
      })
      .filter(
        (entry): entry is FeedbackSubquestionAnswerInput =>
          Boolean(entry?.subquestion_id) && Boolean(entry?.answer_value),
      );

    if (normalized.length !== parsed.length) {
      return null;
    }

    const subquestionIds = normalized.map((entry) => entry.subquestion_id);
    if (new Set(subquestionIds).size !== normalized.length) {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}
