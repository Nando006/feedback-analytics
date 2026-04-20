export type CatalogQuestionInput = {
  question_order?: number;
  question_text?: string;
  is_active?: boolean;
  subquestions?: CatalogSubquestionInput[];
};

export type CatalogSubquestionInput = {
  subquestion_order?: number;
  subquestion_text?: string;
  is_active?: boolean;
};
