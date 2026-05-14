import type { Request, Response } from 'express';
import z from 'zod';
import { createSupabaseServerClient } from '../../config/supabase.js';
import { sendTypedError } from '../../utils/sendTypedError.js';
import {
  API_ERROR_INTERNAL_ERROR,
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_RESET_PASSWORD_FAILED,
} from '../../config/errors.js';

const forgotPasswordSchema = z.object({
  email: z.email({ error: 'E-mail inválido' }),
});

type ForgotPasswordErrorCode =
  | typeof API_ERROR_INVALID_PAYLOAD
  | typeof API_ERROR_RESET_PASSWORD_FAILED
  | typeof API_ERROR_INTERNAL_ERROR
  | 'rate_limited'
  | 'service_unavailable';

function mapSupabaseForgotPasswordError(rawMessage?: string): {
  status: number;
  code: ForgotPasswordErrorCode;
  message: string;
} {
  const message = rawMessage?.trim() ?? '';
  const msg = message.toLowerCase();

  if (
    msg.includes('too many requests') ||
    msg.includes('rate limit') ||
    msg.includes('email rate limit exceeded')
  ) {
    return {
      status: 429,
      code: 'rate_limited',
      message: 'Muitas solicitações. Aguarde alguns instantes e tente novamente.',
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
      message: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
    };
  }

  return {
    status: 400,
    code: API_ERROR_RESET_PASSWORD_FAILED,
    message: message || 'Não foi possível enviar o e-mail de redefinição.',
  };
}

export async function forgotPasswordController(req: Request, res: Response) {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
      issues: parsed.error.issues,
      message: 'Informe um e-mail válido.',
    });
  }

  const { email } = parsed.data;
  const supabase = createSupabaseServerClient(req, res);

  const origin = req.get('origin');
  const xfProto = req.headers['x-forwarded-proto'] as string | undefined;
  const xfHost = req.headers['x-forwarded-host'] as string | undefined;
  const base =
    process.env.PUBLIC_SITE_URL ??
    origin ??
    (xfProto && xfHost
      ? `${xfProto}://${xfHost}`
      : `${req.protocol}://${req.get('host')}`);

  const redirectTo = `${base}/api/public/auth/callback?type=recovery&next=/auth/reset-password`;

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      const mapped = mapSupabaseForgotPasswordError(error.message);
      return sendTypedError(res, mapped.status, mapped.code, {
        message: mapped.message,
      });
    }

    return res.json({
      ok: true,
      message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
    });
  } catch (err) {
    console.error('Forgot password endpoint error:', err);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_ERROR, {
      message: 'Erro interno ao processar a solicitação. Tente novamente.',
    });
  }
}
