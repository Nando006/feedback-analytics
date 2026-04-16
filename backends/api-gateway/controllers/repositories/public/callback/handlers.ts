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
    // Fluxo de troca de e-mail: verifica o OTP para confirmar a mudança
    await supabase.auth.verifyOtp({
      type: 'email_change',
      token_hash: tokenHash,
    });
  } else if (type === 'recovery' && tokenHash) {
    // Fluxo de recuperação de senha: troca o token por uma sessão autenticada.
    // Com a sessão ativa, o frontend pode chamar PATCH /api/protected/user/password.
    await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: tokenHash,
    });
  } else {
    // Fluxo padrão de confirmação de cadastro (signup)
    await supabase.auth.exchangeCodeForSession(req.url);
  }

  return res.redirect(`/auth/success?next=${encodeURIComponent(next)}`);
}
