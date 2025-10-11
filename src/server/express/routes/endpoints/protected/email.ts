import express from 'express';
import { emailUpdateSchema } from 'lib/schemas/user/emailUpdateSchema';
import { requireAuth } from '../../../middleware/auth.js';

export function Email(app: express.Express) {
  // Atualiza o email do usuário.
  app.patch('/api/protected/user/email', requireAuth, async (req, res) => {
    const parsed = emailUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
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
      return res.status(400).json({ error: 'update_failed' });
    }

    return res.json({
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });
  });
}
