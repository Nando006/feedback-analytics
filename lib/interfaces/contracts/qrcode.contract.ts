/**
 * Retorno de sucesso ao enviar feedback via QR Code.
 * Usado em: src/services/serviceFeedbackQRCode.ts.
 */
export interface QrcodeFeedbackResponse {
  ok: boolean;
  id: string;
}

/**
 * Retorno de erro ao enviar feedback via QR Code.
 * Usado em: contratos de erro do fluxo de QR Code (src/services/serviceFeedbackQRCode.ts).
 */
export interface QrcodeFeedbackErrorResponse {
  error: string;
  details?: string;
}

export type FeedbackAnswerValue =
  | 'PESSIMO'
  | 'RUIM'
  | 'MEDIANA'
  | 'BOA'
  | 'OTIMA';

export interface FeedbackQuestionPublic {
  id: string;
  scope_type: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
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

/**
 * Dados principais do feedback enviados pelo formulário público.
 * Usado em: pages/public/qrcode/enterprise.tsx e components/public/forms/fields/fieldsQRCode/ui.types.ts.
 */
export interface FeedbackData {
  message: string;
  rating: number;
  answers: FeedbackQuestionAnswerInput[];
  subanswers: FeedbackSubquestionAnswerInput[];
  enterprise_id: string;
  collection_point_id?: string;
  catalog_item_id?: string;
}

/**
 * Dados opcionais de identificação do cliente no feedback público.
 * Usado em: pages/public/qrcode/enterprise.tsx, components/public/forms/fields/fieldsQRCode/ui.types.ts e fieldCustomerGender.tsx.
 */
export interface CustomerData {
  customer_name?: string;
  customer_email?: string;
  customer_gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar';
}

/**
 * Contexto visual do QR público quando o link representa um item de catálogo.
 * Usado em: fluxo público de QR (loader/página enterprise.tsx).
 */
export interface QrPublicContext {
  item_name?: string | null;
  item_kind?: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' | null;
}