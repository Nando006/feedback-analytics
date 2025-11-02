import express from 'express';
import { loginSchema } from '../../../../../../lib/schemas/public/loginSchema.js';
import { createSupabaseServerClient } from '../../../supabase.js';

// Função para fazer o login.
export function Login(app: express.Express) {
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
}
