import express from 'express';
import { emailUpdateSchema } from '../../../../../../shared/schemas/user/emailUpdateSchema.js';
import { metadadosUpdateSchema } from '../../../../../../shared/schemas/user/metadadosUpdateSchema.js';
import {
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_RESET_PASSWORD_FAILED,
  API_ERROR_RESET_PASSWORD_INVALID_TOKEN,
  API_ERROR_RESET_PASSWORD_WEAK,
  API_ERROR_UPDATE_FAILED,
  API_ERROR_VERIFY_FAILED,
} from '../../../../constants/errors.js';
import { sendTypedError } from '../../../../utils/sendTypedError.js';
import { resetPasswordSchema } from '../../../../../../shared/schemas/user/resetPasswordSchema.js';

export async function getAuthUserHandler(
  req: express.Request,
  res: express.Response,
) {
  return res.json({ user: req.user });
}

export async function patchUserEmailHandler(
  req: express.Request,
  res: express.Response,
) {
  const parsed = emailUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const supabase = req.supabase!;

  const origin = req.get('origin');
  const xfProto = req.headers['x-forwarded-proto'] as string | undefined;
  const xfHost = req.headers['x-forwarded-host'] as string | undefined;
  const base =
    process.env.PUBLIC_SITE_URL ??
    origin ??
    (xfProto && xfHost
      ? `${xfProto}://${xfHost}`
      : `${req.protocol}://${req.get('host')}`);

  const emailRedirectTo = `${base}/api/public/auth/callback?next=/user/dashboard`;

  const { data, error } = await supabase.auth.updateUser(
    { email: parsed.data.email },
    { emailRedirectTo },
  );

  if (error) {
    return sendTypedError(res, 400, API_ERROR_UPDATE_FAILED);
  }

  return res.json({
    user: data.user ? { id: data.user.id, email: data.user.email } : null,
  });
}

export async function patchUserMetadadosHandler(
  req: express.Request,
  res: express.Response,
) {
  const parsed = metadadosUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
  }

  const supabase = req.supabase!;
  const { data, error } = await supabase.auth.updateUser({
    data: parsed.data,
  });

  if (error) {
    return sendTypedError(res, 400, API_ERROR_UPDATE_FAILED);
  }

  return res.json({
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
        }
      : null,
  });
}

export async function startUserPhoneVerificationHandler(
  req: express.Request,
  res: express.Response,
) {
  const phone = String(req.body?.phone ?? '');
  if (!phone) return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);

  const supabase = req.supabase!;
  const { error } = await supabase.auth.updateUser({ phone });
  if (error) return sendTypedError(res, 400, API_ERROR_UPDATE_FAILED);
  return res.json({ ok: true });
}

export async function verifyUserPhoneHandler(
  req: express.Request,
  res: express.Response,
) {
  const token = String(req.body?.token ?? '');
  const phone = String(req.body?.phone ?? '');
  if (!token || !phone)
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);

  const supabase = req.supabase!;
  const { error } = await supabase.auth.verifyOtp({
    type: 'phone_change',
    token,
    phone,
  });
  if (error) return sendTypedError(res, 400, API_ERROR_VERIFY_FAILED);
  return res.json({ ok: true });
}

type ResetPasswordErrorCode =
  | typeof API_ERROR_INVALID_PAYLOAD
  | typeof API_ERROR_RESET_PASSWORD_FAILED
  | typeof API_ERROR_RESET_PASSWORD_WEAK
  | typeof API_ERROR_RESET_PASSWORD_INVALID_TOKEN;

function mapSupabaseResetPasswordError(error: { code?: string; message?: string }): {
  status: number;
  code: ResetPasswordErrorCode;
  message: string;
} {
  const msg = (error.message ?? '').toLowerCase();

  if (
    error.code === 'weak_password' ||
    msg.includes('weak') ||
    msg.includes('password should be')
  ) {
    return {
      status: 400,
      code: API_ERROR_RESET_PASSWORD_WEAK,
      message: 'A nova senha é muito fraca. Use ao menos 6 caracteres.',
    };
  }

  if (
    error.code === 'session_not_found' ||
    error.code === 'invalid_token' ||
    msg.includes('token') ||
    msg.includes('expired') ||
    msg.includes('session')
  ) {
    return {
      status: 401,
      code: API_ERROR_RESET_PASSWORD_INVALID_TOKEN,
      message: 'O link de redefinição expirou ou é inválido. Solicite um novo.',
    };
  }

  return {
    status: 400,
    code: API_ERROR_RESET_PASSWORD_FAILED,
    message: error.message || 'Não foi possível redefinir a senha.',
  };
}

export async function resetPasswordHandler(
  req: express.Request,
  res: express.Response,
) {
  // 1. Valida nova senha e confirmação antes de chamar o Supabase
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
      issues: parsed.error.issues,
      message: 'Dados inválidos para redefinição de senha.',
    });
  }

  // 2. Usa a sessão do middleware requireAuth (estabelecida pelo callback de recovery)
  const supabase = req.supabase!;

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    const mapped = mapSupabaseResetPasswordError({
      code: error.code,
      message: error.message,
    });
    return sendTypedError(res, mapped.status, mapped.code, {
      message: mapped.message,
    });
  }

  return res.json({ ok: true, message: 'Senha redefinida com sucesso.' });
}