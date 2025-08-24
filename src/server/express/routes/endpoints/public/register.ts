import express from 'express';
import { registerSchema } from 'lib/schemas/public/registerSchema';
import { createSupabaseServerClient } from 'src/server/express/supabase';
import z from 'zod';

export function Register(app: express.Express) {
  app.post('/api/public/auth/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'invalid_payload',
        issues: z.treeifyError(parsed.error),
      });
    }

    const data = parsed.data;
    const email = data.email;
    const password = data.password;

    const meta: Record<string, unknown> =
      data.accountType === 'CNPJ'
        ? {
            account_type: 'CNPJ',
            full_name: data.fullName,
            document: data.document,
            phone: data.phone,
            terms_accepted_at: new Date().toISOString(),
            terms_version: 'v1',
          }
        : {
            account_type: 'CPF',
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta, emailRedirectTo },
    });

    if (error) {
      return res
        .status(400)
        .json({ error: 'signup_failed', message: error.message });
    }

    return res.json({ ok: true, message: 'confirmation_required' });
  });
}
