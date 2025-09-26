import type { ActionFunctionArgs } from 'react-router-dom';

export async function ActionRegister({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  // Extraindo os valores dos campos do formulário, convertendo-os para string.
  const accountType = String(form.get('accountType') ?? 'CPF');
  const email = String(form.get('email') ?? '');
  const phone = String(form.get('phone') ?? '');
  const password = String(form.get('password') ?? '');
  const confirmPassword = String(form.get('confirmPassword') ?? '');
  const terms = String(form.get('terms') ?? 'false') === 'true';

  // Campos condicionais
  const fullName = String(form.get('fullName') ?? '');
  const document = String(form.get('document') ?? '');

  // Enviando os valores para o servidor.
  const payload =
    // Condição para CNPJ
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

  // Enviando os valores para o servidor.
  const res = await fetch('/api/public/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    // Verificando se o registro foi bem-sucedido.
    // Opcional: redirecionar para /login após sucesso
    // return redirect('/login')
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Retornando o erro caso o registro falhe.
  const data = await res.json().catch(() => ({ error: 'register_failed' }));
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
