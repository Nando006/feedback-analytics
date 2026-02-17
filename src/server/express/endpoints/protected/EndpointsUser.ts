import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { emailUpdateSchema } from '../../../../../lib/schemas/user/emailUpdateSchema.js';
import { metadadosUpdateSchema } from '../../../../../lib/schemas/user/metadadosUpdateSchema.js';
import {
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_UPDATE_FAILED,
  API_ERROR_VERIFY_FAILED,
} from '../../constants/errors.js';

export function EndpointsUser(app: express.Express) {
  app.get('/api/protected/user/auth_user', requireAuth, async (req, res) => {
    return res.json({ user: req.user });
  });

  // Atualiza e-mail
  app.patch('/api/protected/user/email', requireAuth, async (req, res) => {
    const parsed = emailUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: API_ERROR_INVALID_PAYLOAD });
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
      return res.status(400).json({ error: API_ERROR_UPDATE_FAILED });
    }

    return res.json({
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });
  });

  // Atualiza metadados
  app.patch('/api/protected/user/metadados', requireAuth, async (req, res) => {
    const parsed = metadadosUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: API_ERROR_INVALID_PAYLOAD,
      });
    }

    const supabase = req.supabase!;
    const { data, error } = await supabase.auth.updateUser({
      data: parsed.data,
    });

    if (error) {
      return res.status(400).json({ error: API_ERROR_UPDATE_FAILED });
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
  });

  // Inicia a verificação de telefone (envia OTP)
  app.post('/api/protected/user/phone/start', requireAuth, async (req, res) => {
    const phone = String(req.body?.phone ?? '');
    if (!phone) return res.status(400).json({ error: API_ERROR_INVALID_PAYLOAD });

    const supabase = req.supabase!;
    const { error } = await supabase.auth.updateUser({ phone });
    if (error) return res.status(400).json({ error: API_ERROR_UPDATE_FAILED });
    return res.json({ ok: true });
  });

  // Confirma verificação de telefone (confirma OTP)
  app.post(
    '/api/protected/user/phone/verify',
    requireAuth,
    async (req, res) => {
      const token = String(req.body?.token ?? '');
      const phone = String(req.body?.phone ?? '');
      if (!token || !phone)
        return res.status(400).json({ error: API_ERROR_INVALID_PAYLOAD });

      const supabase = req.supabase!;
      const { error } = await supabase.auth.verifyOtp({
        type: 'phone_change',
        token,
        phone,
      });
      if (error) return res.status(400).json({ error: API_ERROR_VERIFY_FAILED });
      return res.json({ ok: true });
    },
  );
}



