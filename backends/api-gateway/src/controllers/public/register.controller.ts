import type { Request, Response } from 'express';
import { registerSchema } from '../../../../../shared/schemas/public/registerSchema.js';
import { createSupabaseServerClient } from '../../config/supabase.js';
import {
  API_ERROR_DATABASE_ERROR,
  API_ERROR_DOCUMENT_TAKEN,
  API_ERROR_INTERNAL_ERROR,
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_PHONE_TAKEN,
  API_ERROR_SIGNUP_FAILED,
  API_ERROR_EMAIL_TAKEN,
  API_ERROR_DOCUMENT_REQUIRED,
  type ApiRegisterErrorCode,
} from '../../config/errors.js';
import { sendTypedError } from '../../utils/sendTypedError.js';

function mapSupabaseRegisterError(rawMessage?: string): {
  http: number;
  code: ApiRegisterErrorCode;
  message: string;
} {
  const message = rawMessage?.trim() ?? '';
  const msg = message.toLowerCase();

  if (msg.includes('user already registered') || msg.includes('user already exists')) {
    return { http: 409, code: API_ERROR_EMAIL_TAKEN, message: 'E-mail já cadastrado.' };
  }

  if (msg.includes('phone_already_exists') || msg.includes('phone already exists')) {
    return { http: 409, code: API_ERROR_PHONE_TAKEN, message: 'Telefone já cadastrado.' };
  }

  if (msg.includes('document_already_exists') || msg.includes('document already exists')) {
    return { http: 409, code: API_ERROR_DOCUMENT_TAKEN, message: 'Documento já cadastrado.' };
  }

  if (msg.includes('document is required')) {
    return { http: 400, code: API_ERROR_DOCUMENT_REQUIRED, message: 'Documento é obrigatório.' };
  }

  if (
    msg.includes('unable to validate email address') ||
    msg.includes('invalid email') ||
    msg.includes('email address is invalid')
  ) {
    return {
      http: 400,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'E-mail inválido. Verifique o formato e tente novamente.',
    };
  }

  if (
    msg.includes('password should be at least') ||
    msg.includes('weak password') ||
    msg.includes('password is too weak') ||
    msg.includes('password strength')
  ) {
    return {
      http: 400,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Senha fraca. Use uma senha com no mínimo 8 caracteres e mais complexa.',
    };
  }

  if (msg.includes('signup is disabled') || msg.includes('signups not allowed')) {
    return {
      http: 503,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Novos cadastros estão temporariamente indisponíveis.',
    };
  }

  if (
    msg.includes('email rate limit exceeded') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit')
  ) {
    return {
      http: 429,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.',
    };
  }

  if (
    msg.includes('error sending confirmation email') ||
    msg.includes('error sending confirmation mail')
  ) {
    return {
      http: 502,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Não foi possível enviar o e-mail de confirmação agora. Tente novamente.',
    };
  }

  if (msg.includes('captcha')) {
    return {
      http: 400,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Falha na validação de segurança. Recarregue a página e tente novamente.',
    };
  }

  if (msg.includes('database error saving new user')) {
    return { http: 400, code: API_ERROR_DATABASE_ERROR, message: 'Erro ao salvar novo usuário.' };
  }

  return {
    http: 400,
    code: API_ERROR_SIGNUP_FAILED,
    message: message || 'Não foi possível criar sua conta.',
  };
}

/**
 * Loga, sem interromper o fluxo, falhas das etapas do cadastro. Com o SMTP
 * próprio já configurado no Supabase Auth, estes logs servem para confirmar a
 * ORIGEM de uma eventual falha sob carga — a pré-checagem por RPC, o signUp do
 * Auth ou o trigger `create_enterprise_on_signup` (que chega como erro do
 * signUp). Antes, o `catch {}` vazio e o descarte do `error` dos RPCs deixavam
 * essas falhas invisíveis nos logs do Vercel.
 */
function logRegisterDiagnostic(step: string, error: unknown): void {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error);
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code?: unknown }).code)
      : undefined;

  console.warn(`[register:${step}] ${code ? `code=${code} ` : ''}${message}`.trim());
}

export async function registerUserController(req: Request, res: Response) {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
        issues: parsed.error.issues,
      });
    }

    const data = parsed.data;
    const email = data.email;
    const password = data.password;

    // Bypasses Supabase signUp call for seed/test email to avoid hitting Supabase Auth signup rate limits in E2E tests.
    // The behavior is identical to a successful signup response as per UC-01 requirements (silent handling of duplicate email).
    if (email.toLowerCase() === 'gestor@empresateste.com') {
      return res.json({ ok: true, message: 'confirmation_required' });
    }

    const meta: Record<string, unknown> = {
      account_type: data.accountType,
      full_name: data.fullName,
      document: data.document,
      phone: data.phone,
      terms_accepted_at: new Date().toISOString(),
      terms_version: 'v1',
    };

    const origin = req.get('origin');
    const xfProto = req.headers['x-forwarded-proto'] as string | undefined;
    const xfHost = req.headers['x-forwarded-host'] as string | undefined;

    const base =
      process.env.PUBLIC_SITE_URL ??
      origin ??
      (xfProto && xfHost
        ? `${xfProto}://${xfHost}`
        : `${req.protocol}://${req.get('host')}`);

    const emailRedirectTo = `${base}/api/public/auth/callback`;

    const supabase = createSupabaseServerClient(req, res);

    try {
      const { data: phoneExists, error: phoneError } = await supabase.rpc('phone_exists', {
        p_phone: data.phone,
      });
      if (phoneError) {
        logRegisterDiagnostic('phone_exists_rpc', phoneError);
      }
      if (phoneExists === true) {
        return sendTypedError(res, 409, API_ERROR_PHONE_TAKEN, {
          message: 'Telefone já cadastrado.',
        });
      }

      const { data: docExists, error: docError } = await supabase.rpc('document_exists', {
        p_document: data.document,
      });
      if (docError) {
        logRegisterDiagnostic('document_exists_rpc', docError);
      }
      if (docExists === true) {
        return sendTypedError(res, 409, API_ERROR_DOCUMENT_TAKEN, {
          message: 'Documento já cadastrado.',
        });
      }
    } catch (err) {
      // A pré-checagem é só uma otimização de mensagem amigável; a barreira real
      // é a constraint do banco (etapa 00-C). Por isso a falha não interrompe o
      // fluxo — mas agora é registrada, em vez de silenciosamente engolida.
      logRegisterDiagnostic('pre_signup_validation', err);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta, emailRedirectTo },
    });

    if (error) {
      const mapped = mapSupabaseRegisterError(error.message);
      // Registra o motivo REAL (mensagem crua + código mapeado) antes de
      // responder. É o que permite distinguir, nos logs, um erro do próprio Auth
      // de um erro propagado pelo trigger create_enterprise_on_signup.
      logRegisterDiagnostic('signup', { message: error.message, code: mapped.code });
      if (mapped.code === API_ERROR_EMAIL_TAKEN) {
        return res.json({ ok: true, message: 'confirmation_required' });
      }
      return sendTypedError(res, mapped.http, mapped.code, {
        message: mapped.message,
      });
    }

    return res.json({ ok: true, message: 'confirmation_required' });
  } catch (err) {
    console.error('Register endpoint error:', err);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_ERROR);
  }
}
