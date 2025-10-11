/**
 * Centraliza Fetch Json com credentials inclusas para todos os endpoints
 * Helpers finos ed HTTP, sem lógica de domínio
 */

function extractServerMessage(data: unknown): string | undefined {
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const msg = record.message;
    const err = record.error;
    if (typeof msg === 'string') return msg;
    if (typeof err === 'string') return err;
  }
  return undefined;
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...(init ?? {}) });
  if (!res.ok) {
    const error = new Error('Request failed') as Error & {
      status?: number;
      data?: unknown;
    };
    error.status = res.status;
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data: unknown = await res.json();
        error.data = data;
        const serverMessage = extractServerMessage(data);
        if (serverMessage) error.message = serverMessage;
      } else {
        const text = await res.text();
        if (text) {
          error.data = text;
          error.message = text;
        }
      }
    } catch {
      // ignore parse errors, keep generic message
    }
    throw error;
  }

  return res.json() as Promise<T>;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  if (!res.ok) {
    const error = new Error('Request failed') as Error & {
      status?: number;
      data?: unknown;
    };
    error.status = res.status;
    try {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data: unknown = await res.json();
        error.data = data;
        const serverMessage = extractServerMessage(data);
        if (serverMessage) error.message = serverMessage;
      } else {
        const text = await res.text();
        if (text) {
          error.data = text;
          error.message = text;
        }
      }
    } catch {
      // ignore parse errors, keep generic message
    }
    throw error;
  }

  return res.json() as Promise<T>;
}
