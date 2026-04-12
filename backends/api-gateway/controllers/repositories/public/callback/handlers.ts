import type { Request, Response } from 'express';
import { createSupabaseServerClient } from '../../../../database/supabase.js';

export async function authCallbackHandler(req: Request, res: Response) {
  const supabase = createSupabaseServerClient(req, res);

  const q = req.query as Record<string, unknown>;
  const type = String(q.type ?? '');
  const tokenHash = String(q.token_hash ?? '') || String(q.token ?? '');
  const nextParam = String(q.next ?? '/user/dashboard');
  const next = nextParam.startsWith('/') ? nextParam : '/user/dashboard';

  if (type === 'email_change' && tokenHash) {
    await supabase.auth.verifyOtp({
      type: 'email_change',
      token_hash: tokenHash,
    });
  } else {
    await supabase.auth.exchangeCodeForSession(req.url);
  }

  return res.redirect(`/auth/success?next=${encodeURIComponent(next)}`);
}
