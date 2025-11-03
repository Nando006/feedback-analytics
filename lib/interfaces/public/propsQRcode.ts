export interface PropsQrcodeFeedbackResponse {
  ok: boolean;
  id: string;
}

export interface PropsQrcodeFeedbackErrorResponse {
  error: string;
  details?: string;
}

export interface PropsFeedbackData {
  message: string;
  rating: number;
  enterprise_id: string;
}

export interface PropsCustomerData {
  customer_name?: string;
  customer_email?: string;
  customer_gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar';
}

export interface PropsFieldCustomerGender {
  gender: PropsCustomerData['customer_gender'];
  onGenderChange: (gender: PropsCustomerData['customer_gender']) => void;
}

export interface PropsFieldCustomerName {
  name: string;
  onNameChange: (name: string) => void;
}

export interface PropsFieldMessage {
  message: string;
  onMessageChange: (message: string) => void;
}

export interface PropsFieldRating {
  rating: number;
  onRatingChange: (rating: number) => void;
}

export interface PropsFormQRCodeFeedback {
  formData: PropsFeedbackData;
  customerData: PropsCustomerData;
  showOptionalFields: boolean;
  error: string;
  isSubmitting: boolean;
  onFormDataChange: (data: Partial<PropsFeedbackData>) => void;
  onCustomerDataChange: (
    field: keyof PropsCustomerData,
    value: string | undefined,
  ) => void;
  onToggleOptionalFields: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
