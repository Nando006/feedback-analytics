import type { ActionFunctionArgs } from 'react-router-dom';
import { requestApi } from 'src/lib/utils/http';

function getRegisterFallbackByStatus(status: number) {
  if (status === 429) {
    return {
      error: 'rate_limited',
      message: 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.',
    };
  }

  if (status >= 500) {
    return {
      error: 'service_unavailable',
      message: 'Cadastro temporariamente indisponível. Tente novamente em instantes.',
    };
  }

  return {
    error: 'register_failed',
    message: 'Não foi possível concluir seu cadastro. Revise os dados e tente novamente.',
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export async function ActionRegister({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  // Extraindo os valores dos campos do formulário, convertendo-os para string.
  const accountType = String(form.get('accountType') ?? 'CPF');
  const email = String(form.get('email') ?? '');
  const phone = String(form.get('phone') ?? '');
  const password = String(form.get('password') ?? '');
  const confirmPassword = String(form.get('confirmPassword') ?? '');
  const terms = String(form.get('terms') ?? 'false') === 'true';

  // Campos condicionais
  const fullName = String(form.get('fullName') ?? '');
  const document = String(form.get('document') ?? '');

  // Enviando os valores para o servidor.
  const payload = {
    accountType,
    fullName,
    document,
    email,
    phone,
    password,
    confirmPassword,
    terms,
  };

  try {
    const res = await requestApi('/api/public/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Verificando se o registro foi bem-sucedido.
      // Opcional: redirecionar para /login após sucesso
      // return redirect('/login')
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rawBody = await res.text();
    let parsedData: unknown;

    if (rawBody) {
      try {
        parsedData = JSON.parse(rawBody);
      } catch {
        parsedData = null;
      }
    }

    const fallback = getRegisterFallbackByStatus(res.status);
    const data = isObject(parsedData)
      ? {
          error: typeof parsedData.error === 'string' ? parsedData.error : fallback.error,
          message:
            typeof parsedData.message === 'string' && parsedData.message.trim().length > 0
              ? parsedData.message
              : fallback.message,
          issues: parsedData.issues,
        }
      : fallback;

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({
        error: 'network_error',
        message:
          'Não foi possível conectar ao servidor de cadastro. Verifique sua conexão e tente novamente.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
