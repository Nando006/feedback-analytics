import { redirect, type ActionFunctionArgs } from 'react-router-dom';
import { ServiceLogout } from 'src/services/serviceAuth';
import { INTENT_LOGOUT } from 'src/routes/constants/intents';

export async function ActionLogout({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent !== INTENT_LOGOUT) {
    return new Response(JSON.stringify({ error: 'invalid_intent' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await ServiceLogout().catch(() => {});

  return redirect('/login');
}
