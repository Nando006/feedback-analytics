import type {
  FeedbackAnswerValue,
  CustomerData,
  FeedbackData,
  FeedbackQuestionPublic,
} from 'lib/interfaces/contracts/qrcode.contract';

/**
 * Props do campo de gênero opcional do cliente.
 * Usado em: components/public/forms/fields/fieldsQRCode/fieldCustomerGender.tsx.
 */
export interface FieldCustomerGenderProps {
  gender: CustomerData['customer_gender'];
  onGenderChange: (gender: CustomerData['customer_gender']) => void;
}

/**
 * Props do campo de nome opcional do cliente.
 * Usado em: components/public/forms/fields/fieldsQRCode/fieldCustomerName.tsx.
 */
export interface FieldCustomerNameProps {
  name: string;
  onNameChange: (name: string) => void;
}

/**
 * Props do campo de mensagem de feedback.
 * Usado em: components/public/forms/fields/fieldsQRCode/fieldMessage.tsx.
 */
export interface FieldMessageProps {
  message: string;
  onMessageChange: (message: string) => void;
}

/**
 * Props do campo de nota (rating) do feedback.
 * Usado em: components/public/forms/fields/fieldsQRCode/fieldRating.tsx.
 */
export interface FieldRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

/**
 * Props do bloco de perguntas dinâmicas do feedback.
 * Usado em: components/public/forms/fields/fieldsQRCode/fieldDynamicQuestions.tsx.
 */
export interface FieldDynamicQuestionsProps {
  questions: FeedbackQuestionPublic[];
  answers: FeedbackData['answers'];
  subanswers: FeedbackData['subanswers'];
  onAnswerChange: (questionId: string, answerValue: FeedbackAnswerValue) => void;
  onSubanswerChange: (
    subquestionId: string,
    answerValue: FeedbackAnswerValue,
  ) => void;
}

/**
 * Props do formulário completo de feedback por QR Code.
 * Usado em: components/public/forms/formQRCodeFeedback.tsx.
 */
export interface FormQRCodeFeedbackProps {
  formData: FeedbackData;
  questions: FeedbackQuestionPublic[];
  customerData: CustomerData;
  showOptionalFields: boolean;
  error: string;
  isSubmitting: boolean;
  onFormDataChange: (data: Partial<FeedbackData>) => void;
  onAnswerChange: (questionId: string, answerValue: FeedbackAnswerValue) => void;
  onSubanswerChange: (
    subquestionId: string,
    answerValue: FeedbackAnswerValue,
  ) => void;
  onCustomerDataChange: (
    field: keyof CustomerData,
    value: string | undefined,
  ) => void;
  onToggleOptionalFields: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
