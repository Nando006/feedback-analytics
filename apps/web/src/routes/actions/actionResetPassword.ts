import { redirect, type ActionFunctionArgs } from 'react-router-dom';
import { ServiceResetPassword } from 'src/services/serviceAuth';

export async function ActionResetPassword({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  const confirmPassword = String(form.get('confirmPassword') ?? '');

  const result = await ServiceResetPassword({ password, confirmPassword });

  // Sucesso: redireciona para o login com um parâmetro de confirmação visual
  if (result.ok) return redirect('/login?reset=success');

  // Erro: devolve o payload para o componente via useActionData
  return new Response(JSON.stringify(result), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}
