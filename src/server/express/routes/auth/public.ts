import express from 'express';
import { createSupabaseServerClient } from '../../supabase';
import { loginSchema } from '../../../../../lib/schemas/public/loginSchema';
import { registerSchema } from '../../../../../lib/schemas/public/registerSchema';
import z from 'zod';

export function registerPublicAuthRoutes(app: express.Express) {
  app.get('/api/auth/callback', async (req, res) => {
    const supabase = createSupabaseServerClient(req, res);
    await supabase.auth.exchangeCodeForSession(req.url);
    return res.redirect('/auth/success?next=/user/dashboard');
  });

  app.post('/api/auth/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const { email, password, remember } = parsed.data;
    const supabase = createSupabaseServerClient(req, res, { remember });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    return res.json({ ok: true, user: data.user ?? null });
  });

  app.post('/api/auth/register', async (req, res) => {
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
            company_name: data.companyName,
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

    const emailRedirectTo = `${base}/api/auth/callback`;

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
