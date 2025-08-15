/**
 * Centraliza Fetch Json com credentials inclusas para todos os endpoints
 * Helpers finos ed HTTP, sem lógica de domínio
 */

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...(init ?? {}) });
  if (!res.ok) {
    const error = new Error('Request failed');
    (error as any).status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}
