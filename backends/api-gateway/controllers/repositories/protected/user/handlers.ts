import express from 'express';
import { emailUpdateSchema } from '../../../../../../shared/schemas/user/emailUpdateSchema.js';
import { metadadosUpdateSchema } from '../../../../../../shared/schemas/user/metadadosUpdateSchema.js';
import {
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_UPDATE_FAILED,
  API_ERROR_VERIFY_FAILED,
} from '../../../../constants/errors.js';
import { sendTypedError } from '../../../../utils/sendTypedError.js';

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


