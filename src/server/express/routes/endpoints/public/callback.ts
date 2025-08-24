import express from 'express';
import { createSupabaseServerClient } from 'src/server/express/supabase';

export function Callback(app: express.Express) {
  app.get('/api/public/auth/callback', async (req, res) => {
    const supabase = createSupabaseServerClient(req, res);
    await supabase.auth.exchangeCodeForSession(req.url);
    return res.redirect('/auth/success?next=/user/dashboard');
  });
}
