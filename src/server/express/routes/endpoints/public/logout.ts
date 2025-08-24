import express from 'express';
import { createSupabaseServerClient } from 'src/server/express/supabase';

export function Logout(app: express.Express) {
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
