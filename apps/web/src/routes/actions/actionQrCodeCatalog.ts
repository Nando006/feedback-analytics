import type { ActionFunctionArgs } from 'react-router-dom';
import {
  ServiceDisableQrByCatalogItem,
  ServiceEnableQrByCatalogItem,
  ServiceSaveQrCatalogFeedbackQuestions,
  type QrCatalogQuestionInput,
} from 'src/services/serviceCollectionPoints';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
  INTENT_QR_SAVE_FEEDBACK_QUESTIONS,
} from 'src/lib/constants/routes/intents';

type QrToggleIntent =
  | typeof INTENT_QR_ENABLE
  | typeof INTENT_QR_DISABLE
  | typeof INTENT_QR_SAVE_FEEDBACK_QUESTIONS;

function getErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    return String(err.message);
  }

  return 'Falha ao atualizar o QR Code do item. Tente novamente.';
}

export async function ActionQrCodeCatalog({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '') as QrToggleIntent;
  const catalogItemId = String(form.get('catalog_item_id') ?? '').trim();

  if (
    intent !== INTENT_QR_ENABLE &&
    intent !== INTENT_QR_DISABLE &&
    intent !== INTENT_QR_SAVE_FEEDBACK_QUESTIONS
  ) {
    return { error: 'Ação inválida para QR Code.' };
  }

  if (!catalogItemId) {
    return { error: 'Item do catálogo não informado.' };
  }

  try {
    if (intent === INTENT_QR_SAVE_FEEDBACK_QUESTIONS) {
      const questionsRaw = String(form.get('questions') ?? '').trim();

      if (!questionsRaw) {
        return { error: 'Perguntas do item não informadas.' };
      }

      let questions: QrCatalogQuestionInput[];

      try {
        const parsed = JSON.parse(questionsRaw) as unknown;
        if (!Array.isArray(parsed)) {
          throw new Error('Formato inválido');
        }

        questions = parsed as QrCatalogQuestionInput[];
      } catch {
        return { error: 'Formato de perguntas inválido.' };
      }

      const response = await ServiceSaveQrCatalogFeedbackQuestions(
        catalogItemId,
        questions,
      );

      return {
        ok: true,
        questionsSaved: true,
        catalog_item_id: response.catalog_item_id,
        questions: response.questions,
      };
    }

    if (intent === INTENT_QR_DISABLE) {
      const response = await ServiceDisableQrByCatalogItem(catalogItemId);
      return { ok: true, ...response };
    }

    const response = await ServiceEnableQrByCatalogItem(catalogItemId);
    return { ok: true, ...response };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
}
