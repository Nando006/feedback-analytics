export interface QrcodeFeedbackResponse {
  ok: boolean;
  id: string;
}

export interface QrcodeFeedbackErrorResponse {
  error: string;
  details?: string;
}
