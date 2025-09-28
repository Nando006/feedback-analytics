import type { QrcodeFeedbackPayload } from 'lib/schemas/public/feedbackSchema';
import type { QrcodeFeedbackResponse } from 'lib/interfaces/public/qrcode/feedback';
import { postJson } from '../http';

export function submitQrcodeFeedback(payload: QrcodeFeedbackPayload) {
  return postJson<QrcodeFeedbackResponse>(
    '/api/public/qrcode/feedback',
    payload,
  );
}
