import type {
  CustomerData,
  FeedbackAnswerValue,
  FeedbackData,
  FeedbackQuestionPublic,
} from 'lib/interfaces/contracts/qrcode.contract';

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
  formData: FeedbackData;
  customerData: CustomerData;
  showOptionalFields: boolean;
  isSubmitted: boolean;
  error: string;
  hasAlreadySubmitted: boolean;
  isSubmitting: boolean;
  handleFormDataChange: (data: Partial<FeedbackData>) => void;
  handleCustomerDataChange: (
    field: keyof CustomerData,
    value: string | undefined,
  ) => void;
  handleAnswerChange: (
    questionId: string,
    answerValue: FeedbackAnswerValue,
  ) => void;
  handleSubanswerChange: (
    subquestionId: string,
    answerValue: FeedbackAnswerValue,
  ) => void;
  handleToggleOptionalFields: () => void;
  handleSubmit: (event: React.FormEvent) => void;
};