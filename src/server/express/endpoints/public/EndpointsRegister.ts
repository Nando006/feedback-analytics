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

function mapSupabaseRegisterError(rawMessage?: string): {
  http: number;
  code: ApiRegisterErrorCode;
  message: string;
} {
  const message = rawMessage?.trim() ?? '';
  const msg = message.toLowerCase();

  if (msg.includes('user already registered') || msg.includes('user already exists')) {
    return {
      http: 409,
      code: API_ERROR_EMAIL_TAKEN,
      message: 'E-mail já cadastrado.',
    };
  }

  if (msg.includes('phone_already_exists') || msg.includes('phone already exists')) {
    return {
      http: 409,
      code: API_ERROR_PHONE_TAKEN,
      message: 'Telefone já cadastrado.',
    };
  }

  if (msg.includes('document_already_exists') || msg.includes('document already exists')) {
    return {
      http: 409,
      code: API_ERROR_DOCUMENT_TAKEN,
      message: 'Documento já cadastrado.',
    };
  }

  if (msg.includes('document is required')) {
    return {
      http: 400,
      code: API_ERROR_DOCUMENT_REQUIRED,
      message: 'Documento é obrigatório.',
    };
  }

  if (
    msg.includes('unable to validate email address') ||
    msg.includes('invalid email') ||
    msg.includes('email address is invalid')
  ) {
    return {
      http: 400,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'E-mail inválido. Verifique o formato e tente novamente.',
    };
  }

  if (
    msg.includes('password should be at least') ||
    msg.includes('weak password') ||
    msg.includes('password is too weak') ||
    msg.includes('password strength')
  ) {
    return {
      http: 400,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Senha fraca. Use uma senha com no mínimo 8 caracteres e mais complexa.',
    };
  }

  if (msg.includes('signup is disabled') || msg.includes('signups not allowed')) {
    return {
      http: 503,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Novos cadastros estão temporariamente indisponíveis.',
    };
  }

  if (
    msg.includes('email rate limit exceeded') ||
    msg.includes('too many requests') ||
    msg.includes('rate limit')
  ) {
    return {
      http: 429,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.',
    };
  }

  if (
    msg.includes('error sending confirmation email') ||
    msg.includes('error sending confirmation mail')
  ) {
    return {
      http: 502,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Não foi possível enviar o e-mail de confirmação agora. Tente novamente.',
    };
  }

  if (msg.includes('captcha')) {
    return {
      http: 400,
      code: API_ERROR_SIGNUP_FAILED,
      message: 'Falha na validação de segurança. Recarregue a página e tente novamente.',
    };
  }

  if (msg.includes('database error saving new user')) {
    return {
      http: 400,
      code: API_ERROR_DATABASE_ERROR,
      message: 'Erro ao salvar novo usuário.',
    };
  }

  return {
    http: 400,
    code: API_ERROR_SIGNUP_FAILED,
    message: message || 'Não foi possível criar sua conta.',
  };
}

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
        const mapped = mapSupabaseRegisterError(error.message);
        return sendTypedError(res, mapped.http, mapped.code, {
          message: mapped.message,
        });
      }

      // Retorna o usuário registrado. Se não foi, retorna um erro.
      return res.json({ ok: true, message: 'confirmation_required' });
    } catch (err) {
      console.error('Register endpoint error:', err);
      return sendTypedError(res, 500, API_ERROR_INTERNAL_ERROR);
    }
  });
}
