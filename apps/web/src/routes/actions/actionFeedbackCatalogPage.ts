import type { ActionFunctionArgs } from 'react-router-dom';
import { ActionFeedbackSettings } from './actionFeedbackSettings';
import { ActionQrCodeCatalog } from './actionQrCodeCatalog';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
  INTENT_QR_SAVE_FEEDBACK_QUESTIONS,
} from 'src/lib/constants/routes/intents';

const QR_INTENTS = new Set<string>([
  INTENT_QR_ENABLE,
  INTENT_QR_DISABLE,
  INTENT_QR_SAVE_FEEDBACK_QUESTIONS,
]);

export async function ActionFeedbackCatalogPage(args: ActionFunctionArgs) {
  const cloned = args.request.clone();
  const form = await cloned.formData();
  const intent = String(form.get('intent') ?? '');

  if (QR_INTENTS.has(intent)) {
    return ActionQrCodeCatalog(args);
  }

  return ActionFeedbackSettings(args);
}
