import {
  MAX_QUESTION_LENGTH,
  MIN_QUESTION_LENGTH,
  TOTAL_ITEM_QUESTIONS,
  TOTAL_SUBQUESTIONS_PER_QUESTION,
} from '../types.js';
import type {
  CatalogKind,
  QuestionOrder,
  SubquestionOrder,
} from '../types.js';

export function getCatalogKind(value: unknown): CatalogKind | null {
  if (value === 'PRODUCT' || value === 'SERVICE' || value === 'DEPARTMENT') {
    return value;
  }

  return null;
}

export function normalizeQuestionOrder(
  value: unknown,
  fallback: number,
): QuestionOrder {
  const numericValue = Number(value);

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 1 &&
    numericValue <= TOTAL_ITEM_QUESTIONS
  ) {
    return numericValue as QuestionOrder;
  }

  return fallback as QuestionOrder;
}

export function normalizeSubquestionOrder(
  value: unknown,
  fallback: number,
): SubquestionOrder {
  const numericValue = Number(value);

  if (
    Number.isInteger(numericValue) &&
    numericValue >= 1 &&
    numericValue <= TOTAL_SUBQUESTIONS_PER_QUESTION
  ) {
    return numericValue as SubquestionOrder;
  }

  return fallback as SubquestionOrder;
}

export function hasValidQuestionLength(value: string) {
  return value.length >= MIN_QUESTION_LENGTH && value.length <= MAX_QUESTION_LENGTH;
}
