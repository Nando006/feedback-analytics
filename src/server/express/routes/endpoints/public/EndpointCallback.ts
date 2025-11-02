import express from 'express';
import { createSupabaseServerClient } from '../../../supabase.js';

// Função para trocar o código de verificação para uma sessão.
export function EndpointGetCallback(app: express.Express) {
  // Callback (troca o código de verificação para uma sessão).
  app.get('/api/public/auth/callback', async (req, res) => {
    const supabase = createSupabaseServerClient(req, res);

    const q = req.query as Record<string, unknown>;
    const type = String(q.type ?? '');
    const tokenHash = String(q.token_hash ?? '') || String(q.token ?? '');
    const _next = String(q.next ?? '/user/dashboard');
    const next = _next.startsWith('/') ? _next : '/user/dashboard';

    if (type === 'email_change' && tokenHash) {
      await supabase.auth.verifyOtp({
        type: 'email_change',
        token_hash: tokenHash,
      });
    } else {
      await supabase.auth.exchangeCodeForSession(req.url);
    }

    return res.redirect(`/auth/success?next=${encodeURIComponent(next)}`);
  });
}
