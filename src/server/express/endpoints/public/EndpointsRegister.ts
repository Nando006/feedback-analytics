import express from 'express';
import { registerSchema } from '../../../../../lib/schemas/public/registerSchema.js';
import { createSupabaseServerClient } from '../../supabase.js';
import {
  API_ERROR_DATABASE_ERROR,
  API_ERROR_DOCUMENT_REQUIRED,
  API_ERROR_DOCUMENT_TAKEN,
  API_ERROR_EMAIL_TAKEN,
  API_ERROR_INTERNAL_ERROR,
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_PHONE_TAKEN,
  API_ERROR_SIGNUP_FAILED,
  type ApiRegisterErrorCode,
} from '../../../../../lib/constants/server/errors.js';
import { sendTypedError } from '../../../../../lib/utils/sendTypedError.js';

export function EndpointsRegister(app: express.Express) {
  app.post('/api/public/auth/register', async (req, res) => {
    try {
      // Extrai os dados do payload.
      const parsed = registerSchema.safeParse(req.body);

      // Verifica se os dados do payload são válidos. Se não forem, retorna um erro.
      if (!parsed.success) {
        return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD, {
          issues: parsed.error.issues,
        });
      }

      const data = parsed.data;
      const email = data.email;
      const password = data.password;

      // Processa os dados do payload.
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

      // Cria o cliente Supabase (será usado para validações e para o signup).
      const supabase = createSupabaseServerClient(req, res);

      // Pré-validações: evitar erro genérico do supabase e retornar mensagens claras.
      try {
        // verifica telefone existente (usa RPC phone_exists)
        const { data: phoneExists } = await supabase.rpc('phone_exists', {
          p_phone: data.phone,
        });
        if (phoneExists === true) {
          return sendTypedError(res, 409, API_ERROR_PHONE_TAKEN, {
            message: 'Telefone já cadastrado.',
          });
        }

        // verifica documento existente (usa RPC document_exists)
        const { data: docExists } = await supabase.rpc('document_exists', {
          p_document: data.document,
        });
        if (docExists === true) {
          return sendTypedError(res, 409, API_ERROR_DOCUMENT_TAKEN, {
            message: 'Documento já cadastrado.',
          });
        }
      } catch {
        // Falha nas validações não deve impedir o fluxo; segue para o signup e tratamos lá.
      }

      // Signup no Supabase Auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: meta, emailRedirectTo },
      });

      // Verifica se o registro foi bem-sucedido. Se não foi, retorna um erro com mensagem amigável.
      if (error) {
        const msg = (error.message ?? '').toLowerCase();

        // valores padrão
        let http = 400 as 400 | 409;
        let code: ApiRegisterErrorCode = API_ERROR_SIGNUP_FAILED;
        let message = 'Não foi possível criar sua conta.';

        // e-mail já cadastrado (mensagens comuns do Supabase Auth)
        if (msg.includes('user already registered') || msg.includes('user already exists')) {
          http = 409;
          code = API_ERROR_EMAIL_TAKEN;
          message = 'E-mail já cadastrado.';
        }
        // mensagens explicitadas pela função do banco (migração adicionada)
        else if (msg.includes('phone_already_exists')) {
          http = 409;
          code = API_ERROR_PHONE_TAKEN;
          message = 'Telefone já cadastrado.';
        } else if (msg.includes('document_already_exists')) {
          http = 409;
          code = API_ERROR_DOCUMENT_TAKEN;
          message = 'Documento já cadastrado.';
        } else if (msg.includes('document is required')) {
          http = 400;
          code = API_ERROR_DOCUMENT_REQUIRED;
          message = 'Documento é obrigatório.';
        } else if (msg.includes('database error saving new user')) {
          // fallback para erro genérico do Supabase
          http = 400;
          code = API_ERROR_DATABASE_ERROR;
          message = 'Erro ao salvar novo usuário.';
        }

        return sendTypedError(res, http, code, { message });
      }

      // Retorna o usuário registrado. Se não foi, retorna um erro.
      return res.json({ ok: true, message: 'confirmation_required' });
    } catch (err) {
      console.error('Register endpoint error:', err);
      return sendTypedError(res, 500, API_ERROR_INTERNAL_ERROR);
    }
  });
}
