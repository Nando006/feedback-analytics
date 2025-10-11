import express from 'express';
import { registerSchema } from '../../../../../../lib/schemas/public/registerSchema.js';
import { createSupabaseServerClient } from '../../../supabase.js';
import z from 'zod';

// Função para fazer o registro.
export function Register(app: express.Express) {
  app.post('/api/public/auth/register', async (req, res) => {
    // Extrai os dados do payload.
    const parsed = registerSchema.safeParse(req.body);

    // Verifica se os dados do payload são válidos. Se não forem, retorna um erro.
    if (!parsed.success) {
      return res.status(400).json({
        error: 'invalid_payload',
        issues: z.treeifyError(parsed.error),
      });
    }

    const data = parsed.data;
    const email = data.email;
    const password = data.password;

    // Processa os dados do payload. Se for CNPJ, adiciona o tipo de conta, nome completo, documento e telefone. Se for CPF, adiciona o tipo de conta, nome completo, documento e telefone.
    const meta: Record<string, unknown> =
      data.accountType === 'CNPJ'
        ? {
            account_type: 'CNPJ',
            full_name: data.fullName,
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

    const origin = req.get('origin'); // Origem da requisição.
    const xfProto = req.headers['x-forwarded-proto'] as string | undefined; // Protocolo da requisição.
    const xfHost = req.headers['x-forwarded-host'] as string | undefined; // Host da requisição.

    // Processa a URL base da requisição.
    const base =
      process.env.PUBLIC_SITE_URL ??
      origin ??
      (xfProto && xfHost
        ? `${xfProto}://${xfHost}`
        : `${req.protocol}://${req.get('host')}`);

    const emailRedirectTo = `${base}/api/public/auth/callback`; // URL de redirecionamento do email.

    // Cria o cliente Supabase.
    const supabase = createSupabaseServerClient(req, res);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta, emailRedirectTo },
    });

    // Verifica se o registro foi bem-sucedido. Se não foi, retorna um erro.
    if (error) {
      return res
        .status(400)
        .json({ error: 'signup_failed', message: error.message });
    }

    // Retorna o usuário registrado. Se não foi, retorna um erro.
    return res.json({ ok: true, message: 'confirmation_required' });
  });
}
