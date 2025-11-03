import { supabase } from 'src/supabase/supabaseClient';

export type LoginPayload =
  | { email: string; password: string; remember: boolean }
  | { phone: string; password: string; remember: boolean };

export async function ServiceLogin(
  payload: LoginPayload,
): Promise<{ ok: true } | { ok: false; status: number; payload: unknown }> {
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

export async function ServiceLogout(): Promise<boolean> {
  await supabase.auth.signOut().catch(() => {});
  const res = await fetch('/api/public/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}
