import { redirect, type ActionFunctionArgs } from 'react-router-dom';

export async function ActionLogin({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');
  const remember = String(form.get('remember') ?? 'false') === 'true';

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, remember }),
  });

  if (res.ok) return redirect('/user/dashboard');
  const payload = await res.json().catch(() => ({
    error: 'login_failed',
  }));
  return new Response(JSON.stringify(payload), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
