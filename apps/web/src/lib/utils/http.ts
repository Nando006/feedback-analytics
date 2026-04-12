/**
 * Centraliza Fetch Json com credentials inclusas para todos os endpoints
 * Helpers finos ed HTTP, sem lógica de domínio
 */

type HttpError = Error & {
  status?: number;
  code?: string;
};

const WEB_VERCEL_PROJECT_SLUG = 'feedback-analytics-web';
const API_VERCEL_PROJECT_SLUG = 'feedback-analytics-api';

function extractVercelProjectSuffix(hostname: string, projectSlug: string): string | null {
  const normalizedHostname = String(hostname ?? '').trim().toLowerCase();
  const normalizedProjectSlug = String(projectSlug ?? '').trim().toLowerCase();

  if (!normalizedHostname || !normalizedProjectSlug) {
    return null;
  }

  if (normalizedHostname === `${normalizedProjectSlug}.vercel.app`) {
    return '.vercel.app';
  }

  if (
    normalizedHostname.startsWith(`${normalizedProjectSlug}-`) &&
    normalizedHostname.endsWith('.vercel.app')
  ) {
    return normalizedHostname.slice(normalizedProjectSlug.length);
  }

  return null;
}

function normalizeBaseUrl(rawValue: string): string {
  return String(rawValue ?? '').trim().replace(/\/+$/, '');
}

function resolveDerivedVercelApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const suffix = extractVercelProjectSuffix(
    window.location.hostname,
    WEB_VERCEL_PROJECT_SLUG,
  );

  if (!suffix) {
    return '';
  }

  return `${window.location.protocol}//${API_VERCEL_PROJECT_SLUG}${suffix}`;
}

function chooseApiBaseUrl(): string {
  const explicitApiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? '');
  const derivedApiBaseUrl = normalizeBaseUrl(resolveDerivedVercelApiBaseUrl());

  if (!derivedApiBaseUrl) {
    return explicitApiBaseUrl;
  }

  if (!explicitApiBaseUrl) {
    return derivedApiBaseUrl;
  }

  if (typeof window === 'undefined') {
    return explicitApiBaseUrl;
  }

  try {
    const explicitHost = new URL(explicitApiBaseUrl).hostname.toLowerCase();
    const explicitSuffix = extractVercelProjectSuffix(
      explicitHost,
      API_VERCEL_PROJECT_SLUG,
    );
    const currentWebSuffix = extractVercelProjectSuffix(
      window.location.hostname,
      WEB_VERCEL_PROJECT_SLUG,
    );

    // Evita usar alias de outra branch/preview quando o host atual indica um sufixo diferente.
    if (explicitSuffix && currentWebSuffix && explicitSuffix !== currentWebSuffix) {
      return derivedApiBaseUrl;
    }
  } catch {
    return explicitApiBaseUrl;
  }

  return explicitApiBaseUrl;
}

const API_BASE_URL = chooseApiBaseUrl();

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

// Requisição base para manter um único ponto de resolução de URL + credentials
export async function requestApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(resolveApiUrl(path), {
    credentials: 'include',
    ...(init ?? {}),
  });
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
  const res = await requestApi(path, init);

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await requestApi(path, {
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
  const res = await requestApi(path, {
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
  const res = await requestApi(path, {
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
  const res = await requestApi(path, {
    method: 'DELETE',
    credentials: 'include',
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}
