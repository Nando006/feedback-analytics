import type { QrcodeFeedbackPayload } from 'lib/schemas/public/feedbackSchema';
import type { QrcodeFeedbackResponse } from 'lib/interfaces/contracts/qrcode/response.contract';
import { postJson } from 'src/lib/utils/http';

export function ServiceSubmitQrcodeFeedback(payload: QrcodeFeedbackPayload) {
  return postJson<QrcodeFeedbackResponse>(
    '/api/public/qrcode/feedback',
    payload,
  );
}
