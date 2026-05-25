import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for E2E helpers',
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function resetDeviceFingerprint(enterpriseId: string) {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from('tracked_devices')
    .delete()
    .eq('enterprise_id', enterpriseId);

  if (error) {
    console.warn('[supabase-helpers] resetDeviceFingerprint error:', error.message);
  }
}

export async function deleteUserByEmail(email: string) {
  const supabase = getAdminClient();

  const { data, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.warn('[supabase-helpers] listUsers error:', listError.message);
    return;
  }

  const user = data?.users?.find((u) => u.email === email);
  if (!user) return;

  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) {
    console.warn('[supabase-helpers] deleteUser error:', error.message);
  }
}

export async function getEnterpriseIdByAuthUser(email: string): Promise<string | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('enterprises')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error || !data) return null;
  return data.id as string;
}
