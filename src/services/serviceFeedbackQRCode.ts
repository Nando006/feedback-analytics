import type { QrcodeFeedbackPayload } from 'lib/schemas/public/feedbackSchema';
import type { QrcodeFeedbackResponse } from 'lib/interfaces/contracts/public/qrcode.contract';
import { postJson } from '../../lib/utils/http';

export function ServiceSubmitQrcodeFeedback(payload: QrcodeFeedbackPayload) {
  return postJson<QrcodeFeedbackResponse>(
    '/api/public/qrcode/feedback',
    payload,
  );
}
