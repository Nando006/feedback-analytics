export interface QrcodeFeedbackResponse {
  ok: boolean;
  id: string;
}

export interface QrcodeFeedbackErrorResponse {
  error: string;
  details?: string;
}

export interface FeedbackData {
  message: string;
  rating: number;
  enterprise_id: string;
}

export interface CustomerData {
  customer_name?: string;
  customer_email?: string;
  customer_gender?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_informar';
}
