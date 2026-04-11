import { redirect, type ActionFunctionArgs } from 'react-router-dom';
import { ServiceLogin } from 'src/services/serviceAuth.ts';

export async function ActionLogin({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');
  const remember = String(form.get('remember') ?? 'false') === 'true';

  const result = await ServiceLogin({ email, password, remember });

  if (result.ok) return redirect('/user/dashboard?login=success');

  return new Response(JSON.stringify(result.payload), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
