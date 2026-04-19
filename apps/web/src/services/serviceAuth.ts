import { requestApi } from 'src/lib/utils/http';
import { supabase } from 'src/supabase/supabaseClient';

export type LoginPayload =
  { email: string; password: string; remember: boolean };

type ServiceErrorPayload = {
  error: string;
  message: string;
  issues?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function parseErrorPayload(
  rawBody: string,
  fallback: ServiceErrorPayload,
): ServiceErrorPayload {
  if (!rawBody) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(rawBody);
    if (!isObject(parsed)) {
      return fallback;
    }

    return {
      error:
        typeof parsed.error === 'string' && parsed.error.trim().length > 0
          ? parsed.error
          : fallback.error,
      message:
        typeof parsed.message === 'string' && parsed.message.trim().length > 0
          ? parsed.message
          : fallback.message,
      issues: parsed.issues,
    };
  } catch {
    return fallback;
  }
}

function getLoginFallbackByStatus(status: number): ServiceErrorPayload {
  if (status === 429) {
    return {
      error: 'rate_limited',
      message: 'Muitas tentativas de login. Aguarde e tente novamente.',
    };
  }

  if (status >= 500) {
    return {
      error: 'service_unavailable',
      message: 'Serviço de login temporariamente indisponível. Tente novamente.',
    };
  }

  return {
    error: 'login_failed',
    message: 'Não foi possível realizar o login. Verifique os dados e tente novamente.',
  };
}

function getResendFallbackByStatus(status: number): ServiceErrorPayload {
  if (status === 429) {
    return {
      error: 'rate_limited',
      message: 'Muitas tentativas de reenvio. Aguarde e tente novamente.',
    };
  }

  if (status >= 500) {
    return {
      error: 'service_unavailable',
      message: 'Serviço de reenvio temporariamente indisponível. Tente novamente.',
    };
  }

  return {
    error: 'resend_failed',
    message: 'Não foi possível reenviar o e-mail de confirmação.',
  };
}

function getForgotPasswordFallbackByStatus(status: number): ServiceErrorPayload {
  if (status === 429) {
    return {
      error: 'rate_limited',
      message: 'Muitas tentativas. Aguarde e tente novamente.',
    };
  }

  if (status >= 500) {
    return {
      error: 'service_unavailable',
      message: 'Serviço temporariamente indisponível. Tente novamente.',
    };
  }

  return {
    error: 'reset_password_failed',
    message: 'Não foi possível enviar o e-mail de recuperação.',
  };
}

function getResetPasswordFallbackByStatus(status: number): ServiceErrorPayload {
  if (status === 401) {
    return {
      error: 'reset_password_invalid_token',
      message: 'O link de redefinição expirou ou é inválido. Solicite um novo.',
    };
  }

  if (status >= 500) {
    return {
      error: 'service_unavailable',
      message: 'Serviço temporariamente indisponível. Tente novamente.',
    };
  }

  return {
    error: 'reset_password_failed',
    message: 'Não foi possível redefinir a senha.',
  };
}

export async function ServiceLogin(
  payload: LoginPayload,
): Promise<{ ok: true } | { ok: false; status: number; payload: unknown }> {
  try {
    const res = await requestApi('/api/public/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) return { ok: true } as const;

    const fallback = getLoginFallbackByStatus(res.status);
    const rawBody = await res.text();
    const parsed = parseErrorPayload(rawBody, fallback);

    return {
      ok: false,
      status: res.status,
      payload: parsed,
    } as const;
  } catch {
    return {
      ok: false,
      status: 503,
      payload: {
        error: 'network_error',
        message: 'Não foi possível conectar ao servidor de login. Verifique sua conexão.',
      },
    } as const;
  }
}

export async function ServiceLogout(): Promise<boolean> {
  await supabase.auth.signOut().catch(() => {});
  const res = await requestApi('/api/public/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}

export async function ServiceResendConfirmation(
  email: string,
): Promise<
  | { ok: true; message: string }
  | { ok: false; error: string; message: string; issues?: unknown }
> {
  try {
    const res = await requestApi('/api/public/auth/resend-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const rawBody = await res.text();

    if (res.ok) {
      const fallbackSuccess = { message: 'E-mail de confirmação reenviado com sucesso.' };
      const parsed = parseErrorPayload(rawBody, {
        error: 'ok',
        message: fallbackSuccess.message,
      });

      return {
        ok: true,
        message: parsed.message || fallbackSuccess.message,
      };
    }

    const fallback = getResendFallbackByStatus(res.status);
    const parsed = parseErrorPayload(rawBody, fallback);

    return {
      ok: false,
      error: parsed.error,
      message: parsed.message,
      issues: parsed.issues,
    };
  } catch {
    return {
      ok: false,
      error: 'network_error',
      message: 'Não foi possível conectar ao serviço de reenvio. Verifique sua conexão.',
    };
  }
}

export async function ServiceForgotPassword(
  email: string,
): Promise<
  | { ok: true; message: string }
  | { ok: false; error: string; message: string }
> {
  try {
    const res = await requestApi('/api/public/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const rawBody = await res.text();

    if (res.ok) {
      const parsed = parseErrorPayload(rawBody, {
        error: 'ok',
        message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
      });
      return { ok: true, message: parsed.message };
    }

    const fallback = getForgotPasswordFallbackByStatus(res.status);
    const parsed = parseErrorPayload(rawBody, fallback);

    return { ok: false, error: parsed.error, message: parsed.message };
  } catch {
    return {
      ok: false,
      error: 'network_error',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
    };
  }
}

export async function ServiceResetPassword(payload: {
  password: string;
  confirmPassword: string;
}): Promise<
  | { ok: true }
  | { ok: false; error: string; message: string; issues?: unknown }
> {
  try {
    const res = await requestApi('/api/protected/user/password', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) return { ok: true };

    const rawBody = await res.text();
    const fallback = getResetPasswordFallbackByStatus(res.status);
    const parsed = parseErrorPayload(rawBody, fallback);

    return {
      ok: false,
      error: parsed.error,
      message: parsed.message,
      issues: parsed.issues,
    };
  } catch {
    return {
      ok: false,
      error: 'network_error',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
    };
  }
}