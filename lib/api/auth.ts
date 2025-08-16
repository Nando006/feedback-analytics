import { supabase } from 'src/supabase/supabaseClient';

export async function logout(): Promise<boolean> {
  await supabase.auth.signOut().catch(() => {});
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  return res.ok;
}
