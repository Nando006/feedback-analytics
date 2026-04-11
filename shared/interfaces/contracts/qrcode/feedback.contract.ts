import type {
  FeedbackQuestionAnswerInput,
  FeedbackSubquestionAnswerInput,
} from './question.contract';
import type { QrcodeCatalogItemKind } from './scope.contract';

/**
 * Contratos de payload principal do formulario publico de QR Code.
 * Servem para envio de feedback e dados opcionais do cliente.
 */

/**
 * Dados principais do feedback enviados pelo formulário público.
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
 */
export interface CustomerData {
  customer_name?: string;
  customer_email?: string;
  customer_gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar';
}

/**
 * Contexto visual do QR público quando o link representa um item de catálogo.
 */
export interface QrPublicContext {
  item_name?: string | null;
  item_kind?: QrcodeCatalogItemKind | null;
}
