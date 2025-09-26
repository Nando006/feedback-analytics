import express from 'express';
import { loginSchema } from 'lib/schemas/public/loginSchema';
import { createSupabaseServerClient } from 'src/server/express/supabase';

// Função para fazer o login.
export function Login(app: express.Express) {
  app.post('/api/public/auth/login', async (req, res) => {
    // Extrai os dados do payload.
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const payload = parsed.data;
    const supabase = createSupabaseServerClient(req, res, {
      remember: payload.remember ?? false,
    });

    // Faz o login com email ou telefone.
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

    // Verifica se o login foi bem-sucedido. Se não foi, retorna um erro.
    if (error) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    // Retorna o usuário logado. Se não foi, retorna null.
    return res.json({ ok: true, user: data.user ?? null });
  });
}
