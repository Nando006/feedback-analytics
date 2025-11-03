/**
 * Centraliza Fetch Json com credentials inclusas para todos os endpoints
 * Helpers finos ed HTTP, sem lógica de domínio
 */

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...(init ?? {}) });
  if (!res.ok) {
    const error = new Error('Request failed');
    (error as Error & { status?: number }).status = res.status;
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
    const error = new Error('Request failed');
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

export async function patchJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  if (!res.ok) {
    const error = new Error('Request failed');
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

export async function putJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  if (!res.ok) {
    const error = new Error('Request failed');
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

export async function deleteJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    method: 'DELETE',
    credentials: 'include',
    ...(init ?? {}),
  });

  if (!res.ok) {
    const error = new Error('Request failed');
    (error as Error & { status?: number }).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}
