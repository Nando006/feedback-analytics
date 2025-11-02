import type { ActionFunctionArgs } from 'react-router-dom';
import {
  ServiceStartPhoneVerification,
  ServiceUpdateEmail,
  ServiceUpdateMetadados,
  ServiceVerifyPhone,
} from 'src/services/ServiceUser';

export async function ActionProfile({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  // Atualiza o nome do usuário.
  if (intent === 'update_full_name') {
    const full_name = String(form.get('full_name') ?? '');
    if (!full_name) {
      return new Response(JSON.stringify({ error: 'invalid_payload' }), {
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
  if (intent === 'update_email') {
    const email = String(form.get('email') ?? '');
    if (!email) {
      return new Response(JSON.stringify({ error: 'invalid_payload' }), {
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
  if (intent === 'start_phone') {
    const phone = String(form.get('phone') ?? '');
    if (!phone) {
      return new Response(JSON.stringify({ error: 'invalid_payload' }), {
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
  if (intent === 'verify_phone') {
    const token = String(form.get('token') ?? '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'invalid_payload' }), {
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
  return new Response(JSON.stringify({ error: 'invalid_intent' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
