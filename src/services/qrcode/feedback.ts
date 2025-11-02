import type { QrcodeFeedbackPayload } from 'lib/schemas/public/feedbackSchema';
import type { PropsQrcodeFeedbackResponse } from 'lib/interfaces/public/propsQRcode';
import { postJson } from '../http';

export function submitQrcodeFeedback(payload: QrcodeFeedbackPayload) {
  return postJson<PropsQrcodeFeedbackResponse>(
    '/api/public/qrcode/feedback',
    payload,
  );
}
