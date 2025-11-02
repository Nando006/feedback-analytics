export type LoginPayload =
  | { email: string; password: string; remember: boolean }
  | { phone: string; password: string; remember: boolean };

/**
 * Realiza login na API pública.
 * Retorna ok=true em sucesso; caso contrário, retorna status e payload do erro.
 */
export async function login(
  payload: LoginPayload,
): Promise<
  | { ok: true }
  | { ok: false; status: number; payload: unknown }
> {
  const res = await fetch('/api/public/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) return { ok: true } as const;

  const json = await res.json().catch(() => ({ error: 'login_failed' }));
  return { ok: false, status: res.status, payload: json } as const;
}
