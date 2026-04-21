import type { ActionFunctionArgs } from 'react-router-dom';
import {
  ServiceDisableQr,
  ServiceEnableQr,
} from 'src/services/serviceCollectionPoints';
import {
  INTENT_QR_DISABLE,
  INTENT_QR_ENABLE,
} from 'src/lib/constants/routes/intents';

type QrToggleIntent = typeof INTENT_QR_ENABLE | typeof INTENT_QR_DISABLE;

function getErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    return String(err.message);
  }

  return 'Falha ao atualizar o QR Code. Tente novamente.';
}

export async function ActionQrCodeEnterprise({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '') as QrToggleIntent;

  if (intent !== INTENT_QR_ENABLE && intent !== INTENT_QR_DISABLE) {
    return { error: 'Ação inválida para QR Code.' };
  }

  try {
    if (intent === INTENT_QR_DISABLE) {
      await ServiceDisableQr();
      return { ok: true, active: false };
    }

    await ServiceEnableQr();
    return { ok: true, active: true };
  } catch (err) {
    return { error: getErrorMessage(err) };
  }
}