import type { Request, Response } from 'express';
import z from 'zod';
import { createSupabaseServerClient } from '../../../../database/supabase.js';
import { sendTypedError } from 'server/utils/sendTypedError.js';
import {
  API_ERROR_INTERNAL_ERROR,
  API_ERROR_INVALID_PAYLOAD,
} from 'server/constants/errors.js';

const resendConfirmationSchema = z.object({
  email: z.email({ error: 'E-mail inválido' }),
});

type ResendEndpointErrorCode =
  | typeof API_ERROR_INVALID_PAYLOAD
  | typeof API_ERROR_INTERNAL_ERROR
  | 'rate_limited'
  | 'service_unavailable'
  | 'resend_failed';

function mapSupabaseResendError(rawMessage?: string): {
  status: number;
  code: ResendEndpointErrorCode;
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
      message: 'Muitas solicitações de reenvio. Aguarde alguns instantes e tente novamente.',
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
      message: 'Serviço de reenvio temporariamente indisponível. Tente novamente em instantes.',
    };
  }

  if (msg.includes('signup is disabled') || msg.includes('signups not allowed')) {
    return {
      status: 503,
      code: 'service_unavailable',
      message: 'Reenvio de confirmação indisponível no momento.',
    };
  }

  return {
    status: 400,
    code: 'resend_failed',
    message: message || 'Falha ao reenviar e-mail de confirmação.',
  };
}

export async function resendConfirmationHandler(req: Request, res: Response) {
  const parsed = resendConfirmationSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
      issues: parsed.error.issues,
      message: 'Informe um e-mail válido para reenviar a confirmação.',
    });
  }

  const { email } = parsed.data;
  const supabase = createSupabaseServerClient(req, res);

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      const mapped = mapSupabaseResendError(error.message);
      return sendTypedError(res, mapped.status, mapped.code, {
        message: mapped.message,
      });
    }

    return res.json({
      ok: true,
      message: 'E-mail de confirmação reenviado com sucesso.',
    });
  } catch (err) {
    console.error('Resend confirmation endpoint error:', err);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_ERROR, {
      message: 'Erro interno ao reenviar e-mail. Tente novamente.',
    });
  }
}
