import type { Request, Response } from 'express';
import { loginSchema } from '../../../../../shared/schemas/public/loginSchema.js';
import { createSupabaseServerClient } from '../../config/supabase.js';
import {
  API_ERROR_INTERNAL_ERROR,
  API_ERROR_EMAIL_NOT_CONFIRMED,
  API_ERROR_INVALID_CREDENTIALS,
  API_ERROR_INVALID_PAYLOAD,
} from '../../config/errors.js';
import { sendTypedError } from '../../utils/sendTypedError.js';

type LoginEndpointErrorCode =
  | typeof API_ERROR_INVALID_PAYLOAD
  | typeof API_ERROR_INVALID_CREDENTIALS
  | typeof API_ERROR_EMAIL_NOT_CONFIRMED
  | typeof API_ERROR_INTERNAL_ERROR
  | 'rate_limited'
  | 'service_unavailable'
  | 'login_failed';

function mapSupabaseLoginError(error: { code?: string; message?: string }): {
  status: number;
  code: LoginEndpointErrorCode;
  message: string;
} {
  const message = error.message?.trim() ?? '';
  const msg = message.toLowerCase();

  if (
    error.code === 'email_not_confirmed' ||
    msg.includes('email not confirmed') ||
    msg.includes('email_not_confirmed')
  ) {
    return {
      status: 401,
      code: API_ERROR_EMAIL_NOT_CONFIRMED,
      message:
        'Conta não verificada. Verifique seu e-mail e use o link de confirmação para ativar o acesso.',
    };
  }

  if (
    msg.includes('too many requests') ||
    msg.includes('rate limit') ||
    msg.includes('email rate limit exceeded')
  ) {
    return {
      status: 429,
      code: 'rate_limited',
      message: 'Muitas tentativas de login. Aguarde alguns instantes e tente novamente.',
    };
  }

  if (
    msg.includes('unable to validate email address') ||
    msg.includes('invalid email') ||
    msg.includes('email address is invalid')
  ) {
    return {
      status: 400,
      code: API_ERROR_INVALID_PAYLOAD,
      message: 'E-mail inválido. Verifique o formato informado.',
    };
  }

  if (
    msg.includes('service unavailable') ||
    msg.includes('temporarily unavailable') ||
    msg.includes('internal server error') ||
    msg.includes('unexpected failure')
  ) {
    return {
      status: 503,
      code: 'service_unavailable',
      message: 'Serviço de login temporariamente indisponível. Tente novamente em instantes.',
    };
  }

  if (
    error.code === 'invalid_credentials' ||
    error.code === 'invalid_grant' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials')
  ) {
    return {
      status: 401,
      code: API_ERROR_INVALID_CREDENTIALS,
      message: 'E-mail ou senha incorretos. Revise as credenciais e tente novamente.',
    };
  }

  return {
    status: 401,
    code: 'login_failed',
    message: message || 'Não foi possível realizar o login no momento.',
  };
}

export async function loginController(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
        issues: parsed.error.issues,
        message: 'Dados de login inválidos.',
      });
    }

    const payload = parsed.data;
    const supabase = createSupabaseServerClient(req, res, {
      remember: payload.remember ?? false,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      const mapped = mapSupabaseLoginError({
        code: error.code,
        message: error.message,
      });

      return sendTypedError(res, mapped.status, mapped.code, {
        message: mapped.message,
      });
    }

    return res.json({ ok: true, user: data.user ?? null });
  } catch (err) {
    console.error('Login endpoint error:', err);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_ERROR, {
      message: 'Falha temporária ao processar login. Tente novamente.',
    });
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    const supabase = createSupabaseServerClient(req, res);
    await supabase.auth.signOut({ scope: 'global' });

    res.setHeader('Cache-Control', 'no-store');
    return res.status(204).end();
  } catch {
    return res.status(500).json({ ok: false });
  }
}
