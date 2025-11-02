import { redirect, type ActionFunctionArgs } from 'react-router-dom';
import { ServiceLogin } from 'src/services/ServiceAuth';

export async function ActionLogin({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const email = String(form.get('email') ?? '');
  const phone = String(form.get('phone') ?? '');
  const password = String(form.get('password') ?? '');
  const remember = String(form.get('remember') ?? 'false') === 'true';

  const result = await ServiceLogin(
    email ? { email, password, remember } : { phone, password, remember },
  );

  if (result.ok) return redirect('/user/dashboard');

  return new Response(JSON.stringify(result.payload), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
