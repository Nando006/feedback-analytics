import type { ActionFunctionArgs } from 'react-router-dom';
import {
  ServiceStartPhoneVerification,
  ServiceUpdateEmail,
  ServiceUpdateMetadados,
  ServiceVerifyPhone,
} from 'src/services/serviceUser';
import {
  INTENT_PROFILE_START_PHONE,
  INTENT_PROFILE_UPDATE_EMAIL,
  INTENT_PROFILE_UPDATE_FULL_NAME,
  INTENT_PROFILE_VERIFY_PHONE,
} from 'src/lib/constants/routes/intents';
import {
  ACTION_ERROR_INVALID_INTENT,
  ACTION_ERROR_INVALID_PAYLOAD,
} from 'src/lib/constants/routes/errors';

export async function ActionProfile({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  // Atualiza o nome do usuário.
  if (intent === INTENT_PROFILE_UPDATE_FULL_NAME) {
    const full_name = String(form.get('full_name') ?? '');
    if (!full_name) {
      return { error: ACTION_ERROR_INVALID_PAYLOAD };
    }
    await ServiceUpdateMetadados(full_name);
    return { ok: true };
  }

  // Atualiza o e-mail do usuário.
  if (intent === INTENT_PROFILE_UPDATE_EMAIL) {
    const email = String(form.get('email') ?? '');
    if (!email) {
      return { error: ACTION_ERROR_INVALID_PAYLOAD };
    }
    await ServiceUpdateEmail(email);
    return { ok: true };
  }

  // Inicia a verificação do telefone do usuário.
  if (intent === INTENT_PROFILE_START_PHONE) {
    const phone = String(form.get('phone') ?? '');
    if (!phone) {
      return { error: ACTION_ERROR_INVALID_PAYLOAD };
    }
    await ServiceStartPhoneVerification(phone);
    return { ok: true };
  }

  // Confirma a verificação do telefone do usuário.
  if (intent === INTENT_PROFILE_VERIFY_PHONE) {
    const token = String(form.get('token') ?? '');
    if (!token) {
      return { error: ACTION_ERROR_INVALID_PAYLOAD };
    }
    await ServiceVerifyPhone(token);
    return { ok: true };
  }

  // Retorna um erro caso o intent seja inválido.
  return { error: ACTION_ERROR_INVALID_INTENT };
}