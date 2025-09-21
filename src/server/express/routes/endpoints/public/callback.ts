import express from 'express';
import { createSupabaseServerClient } from 'src/server/express/supabase';

// Função para trocar o código de verificação para uma sessão.
export function Callback(app: express.Express) {
  // Callback (troca o código de verificação para uma sessão).
  app.get('/api/public/auth/callback', async (req, res) => {
    const supabase = createSupabaseServerClient(req, res);
    await supabase.auth.exchangeCodeForSession(req.url);
    return res.redirect('/auth/success?next=/user/dashboard');
  });
}
