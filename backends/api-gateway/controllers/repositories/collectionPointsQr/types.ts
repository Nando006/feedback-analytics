export type CatalogKind = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

export type QuestionOrder = 1 | 2 | 3;
export type SubquestionOrder = 1 | 2 | 3;

export type CatalogSubquestionInput = {
  subquestion_order?: number;
  subquestion_text?: string;
  is_active?: boolean;
};

export type CatalogQuestionInput = {
  question_order?: number;
  question_text?: string;
  is_active?: boolean;
  subquestions?: CatalogSubquestionInput[];
};

export type CatalogQuestionSnapshot = {
  id: string;
  question_order: QuestionOrder;
  question_text: string;
  is_active: boolean;
  subquestions: Array<{
    id: string;
    question_id: string;
    subquestion_order: SubquestionOrder;
    subquestion_text: string;
    is_active: boolean;
  }>;
};

export const TOTAL_ITEM_QUESTIONS = 3;
export const TOTAL_SUBQUESTIONS_PER_QUESTION = 3;
export const MIN_QUESTION_LENGTH = 20;
export const MAX_QUESTION_LENGTH = 150;
