import type {
  CustomerData,
  FeedbackData,
} from 'lib/interfaces/contracts/public/qrcode.contract';

export interface FieldCustomerGenderProps {
  gender: CustomerData['customer_gender'];
  onGenderChange: (gender: CustomerData['customer_gender']) => void;
}

export interface FieldCustomerNameProps {
  name: string;
  onNameChange: (name: string) => void;
}

export interface FieldMessageProps {
  message: string;
  onMessageChange: (message: string) => void;
}

export interface FieldRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

export interface FormQRCodeFeedbackProps {
  formData: FeedbackData;
  customerData: CustomerData;
  showOptionalFields: boolean;
  error: string;
  isSubmitting: boolean;
  onFormDataChange: (data: Partial<FeedbackData>) => void;
  onCustomerDataChange: (
    field: keyof CustomerData,
    value: string | undefined,
  ) => void;
  onToggleOptionalFields: () => void;
  onSubmit: (e: React.FormEvent) => void;
}
