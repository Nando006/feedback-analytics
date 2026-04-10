/**
 * Centraliza Fetch Json com credentials inclusas para todos os endpoints
 * Helpers finos ed HTTP, sem lógica de domínio
 */

type HttpError = Error & {
  status?: number;
  code?: string;
};

// Fazer o frontend passar a suportar API em domínio separado, usando a variável de ambiente VITE_API_BASE_URL
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? '')
  .trim()
  .replace(/\/+$/, '');

function resolveApiUrl(path: string): string {
  const value = String(path ?? '').trim();

  if (!value) {
    return API_BASE_URL || '/';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;

  return API_BASE_URL
    ? `${API_BASE_URL}${normalizedPath}`
    : normalizedPath;
}

async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;

  let message = 'Request failed';
  let code: string | undefined;

  try {
    const payload = (await res.clone().json()) as {
      error?: string;
      message?: string;
    };

    if (typeof payload?.error === 'string' && payload.error.length > 0) {
      code = payload.error;
      message = payload.error;
    } else if (
      typeof payload?.message === 'string' &&
      payload.message.length > 0
    ) {
      message = payload.message;
    }
  } catch {
    // resposta sem JSON, mantém a mensagem padrão
  }

  const error = new Error(message) as HttpError;
  error.status = res.status;
  error.code = code;
  throw error;
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(resolveApiUrl(path), {
    credentials: 'include',
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(resolveApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function patchJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(resolveApiUrl(path), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function putJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(resolveApiUrl(path), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function deleteJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(resolveApiUrl(path), {
    method: 'DELETE',
    credentials: 'include',
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}
