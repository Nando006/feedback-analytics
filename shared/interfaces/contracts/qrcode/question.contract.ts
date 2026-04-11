import type { QrcodeScopeType } from './scope.contract';

/**
 * Contratos de perguntas e respostas do QR Code.
 * Servem para tipar perguntas publicas e payloads de resposta do formulario.
 */
export type FeedbackAnswerValue =
  | 'PESSIMO'
  | 'RUIM'
  | 'MEDIANA'
  | 'BOA'
  | 'OTIMA';

export interface FeedbackQuestionPublic {
  id: string;
  scope_type: QrcodeScopeType;
  catalog_item_id: string | null;
  question_order: 1 | 2 | 3;
  question_text: string;
  subquestions?: FeedbackSubquestionPublic[];
}

export interface FeedbackSubquestionPublic {
  id: string;
  question_id: string;
  subquestion_order: 1 | 2 | 3;
  subquestion_text: string;
  is_active: boolean;
}

export interface FeedbackQuestionAnswerInput {
  question_id: string;
  answer_value: FeedbackAnswerValue;
}

export interface FeedbackSubquestionAnswerInput {
  subquestion_id: string;
  answer_value: FeedbackAnswerValue;
}
