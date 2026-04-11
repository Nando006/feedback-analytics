/**
 * Contratos de resposta do endpoint de feedback público via QR Code.
 * Servem para padronizar retorno de sucesso e erro do envio.
 */
export interface QrcodeFeedbackResponse {
  ok: boolean;
  id: string;
}

export interface QrcodeFeedbackErrorResponse {
  error: string;
  details?: string;
}
