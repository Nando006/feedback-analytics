import type { ActionFunctionArgs } from 'react-router-dom';

export async function ActionRegister({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const accountType = String(form.get('accountType') ?? 'CPF');
  const email = String(form.get('email') ?? '');
  const phone = String(form.get('phone') ?? '');
  const password = String(form.get('password') ?? '');
  const confirmPassword = String(form.get('confirmPassword') ?? '');
  const terms = String(form.get('terms') ?? 'false') === 'true';

  // Campos condicionais
  const fullName = String(form.get('fullName') ?? '');
  const document = String(form.get('document') ?? '');

  const payload =
    accountType === 'CNPJ'
      ? {
          accountType,
          fullName,
          document,
          email,
          phone,
          password,
          confirmPassword,
          terms,
        }
      : {
          accountType,
          fullName,
          document,
          email,
          phone,
          password,
          confirmPassword,
          terms,
        };

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    // Opcional: redirecionar para /login após sucesso
    // return redirect('/login')
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await res.json().catch(() => ({ error: 'register_failed' }));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
