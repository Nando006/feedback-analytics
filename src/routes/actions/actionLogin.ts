import { redirect, type ActionFunctionArgs } from 'react-router-dom';

export async function ActionLogin({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  // Extraindo os valores dos campos do formulário, convertendo-os para string.
  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');
  const remember = String(form.get('remember') ?? 'false') === 'true';

  // Enviando os valores para o servidor.
  const res = await fetch('/api/public/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, remember }),
  });

  // Verificando se o login foi bem-sucedido.
  if (res.ok) return redirect('/user/dashboard');
  const payload = await res.json().catch(() => ({
    error: 'login_failed',
  }));

  // Retornando o erro caso o login falhe.
  return new Response(JSON.stringify(payload), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
