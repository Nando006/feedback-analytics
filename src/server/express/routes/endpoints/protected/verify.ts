import express from 'express';
import { requireAuth } from '../../../middleware/auth';

export function VerifyPhone(app: express.Express) {
  // Inicia a verificação de telefone (envia OTP)
  app.post('/api/protected/user/phone/start', requireAuth, async (req, res) => {
    const phone = String(req.body?.phone ?? '');
    if (!phone) return res.status(400).json({ error: 'invalid_payload' });

    const supabase = req.supabase;
    const { error } = await supabase.auth.updateUser({ phone });
    if (error) return res.status(400).json({ error: 'update_failed' });
    return res.json({ ok: true });
  });

  // Confirma verificação de telefone (confirma OTP)
  app.post(
    '/api/protected/user/phone/verify',
    requireAuth,
    async (req, res) => {
      const token = String(req.body?.token ?? '');
      if (!token) return res.status(400).json({ error: 'invalid_payload' });

      const supabase = req.supabase;
      const { error } = await supabase.auth.verifyOtp({
        type: 'phone_change',
        token,
      });
      if (error) return res.status(400).json({ error: 'verify_failed' });
      return res.json({ ok: true });
    },
  );
}
