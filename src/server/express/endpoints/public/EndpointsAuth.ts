import express from 'express';
import { loginSchema } from '../../../../../lib/schemas/public/loginSchema.js';
import { createSupabaseServerClient } from '../../supabase.js';

export function EndpointsAuth(app: express.Express) {
  app.post('/api/public/auth/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const payload = parsed.data;
    const supabase = createSupabaseServerClient(req, res, {
      remember: payload.remember ?? false,
    });

    const { data, error } =
      'email' in payload
        ? await supabase.auth.signInWithPassword({
            email: payload.email,
            password: payload.password,
          })
        : await supabase.auth.signInWithPassword({
            phone: payload.phone,
            password: payload.password,
          });

    if (error) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    return res.json({ ok: true, user: data.user ?? null });
  });

  // Logout (limpa cookies httpOnly da sessão)
  app.post('/api/public/auth/logout', async (req, res) => {
    try {
      const supabase = createSupabaseServerClient(req, res);
      // Revoga refresh token e limpa cookies httpOnly via SSR
      await supabase.auth.signOut({ scope: 'global' });

      // Evita qualquer cache e finaliza sem body
      res.setHeader('Cache-Control', 'no-store');
      return res.status(204).end();
    } catch {
      return res.status(500).json({ ok: false });
    }
  });
}

