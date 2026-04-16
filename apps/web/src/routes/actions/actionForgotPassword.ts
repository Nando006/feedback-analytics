
import { type ActionFunctionArgs } from 'react-router-dom';
import { ServiceForgotPassword } from 'src/services/serviceAuth';

export async function ActionForgotPassword({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '');

  const result = await ServiceForgotPassword(email);

  // Tanto no sucesso quanto no erro retornamos JSON para o componente via useActionData.
  // Não há redirect aqui: o formulário exibe uma mensagem de confirmação no lugar.
  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}