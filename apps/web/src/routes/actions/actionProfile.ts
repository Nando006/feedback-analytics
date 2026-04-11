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
      return new Response(JSON.stringify({ error: ACTION_ERROR_INVALID_PAYLOAD }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await ServiceUpdateMetadados(full_name);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Atualiza o e-mail do usuário.
  if (intent === INTENT_PROFILE_UPDATE_EMAIL) {
    const email = String(form.get('email') ?? '');
    if (!email) {
      return new Response(JSON.stringify({ error: ACTION_ERROR_INVALID_PAYLOAD }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await ServiceUpdateEmail(email);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Inicia a verificação do telefone do usuário.
  if (intent === INTENT_PROFILE_START_PHONE) {
    const phone = String(form.get('phone') ?? '');
    if (!phone) {
      return new Response(JSON.stringify({ error: ACTION_ERROR_INVALID_PAYLOAD }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await ServiceStartPhoneVerification(phone);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Confirma a verificação do telefone do usuário.
  if (intent === INTENT_PROFILE_VERIFY_PHONE) {
    const token = String(form.get('token') ?? '');
    if (!token) {
      return new Response(JSON.stringify({ error: ACTION_ERROR_INVALID_PAYLOAD }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await ServiceVerifyPhone(token);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Retorna um erro caso o intent seja inválido.
  return new Response(JSON.stringify({ error: ACTION_ERROR_INVALID_INTENT }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
