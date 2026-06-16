import type { ActionFunctionArgs } from 'react-router-dom';
import { ActionFeedbackSettings } from './actionFeedbackSettings';
import { ActionQrCodeEnterprise } from './actionQrCodeEnterprise';
import { INTENT_QR_DISABLE, INTENT_QR_ENABLE } from 'src/lib/constants/routes/intents';

const QR_INTENTS = new Set<string>([INTENT_QR_ENABLE, INTENT_QR_DISABLE]);

/**
 * Action da tela "Feedback geral": despacha por intent.
 * - Ativar/desativar QR geral → ActionQrCodeEnterprise.
 * - Salvar perguntas gerais (INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS) → ActionFeedbackSettings.
 */
export async function ActionFeedbackGeneralPage(args: ActionFunctionArgs) {
  const cloned = args.request.clone();
  const form = await cloned.formData();
  const intent = String(form.get('intent') ?? '');

  if (QR_INTENTS.has(intent)) {
    return ActionQrCodeEnterprise(args);
  }

  return ActionFeedbackSettings(args);
}
