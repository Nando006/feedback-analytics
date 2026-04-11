import type {
  FeedbackQuestionPublic,
} from 'lib/interfaces/contracts/qrcode/question.contract';
import type { PublicQrFeedbackFormViewModel } from 'components/public/forms/fields/fieldsQRCode/ui.types';

/**
 * Resultado da action de envio de feedback por QR Code.
 * Usado em: pages/public/qrcode/enterprise.tsx.
 */
export type QrcodeEnterpriseActionData = {
  ok?: boolean;
  alreadySubmitted?: boolean;
  error?: string;
};

/**
 * Parâmetros do controller do formulário público QR.
 */
export type QrCodeFeedbackControllerParams = {
  enterpriseId: string;
  collectionPointId: string;
  catalogItemId: string;
  initialError: string;
  questions: FeedbackQuestionPublic[];
};

/**
 * Retorno do controller do formulário público QR.
 */
export type QrCodeFeedbackControllerResult = {
  formModel: PublicQrFeedbackFormViewModel;
  hasAlreadySubmitted: boolean;
  isSubmitted: boolean;
};