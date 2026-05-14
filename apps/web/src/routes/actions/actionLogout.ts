import { redirect, type ActionFunctionArgs } from 'react-router-dom';
import { ServiceLogout } from 'src/services/serviceAuth';
import { INTENT_LOGOUT } from 'src/lib/constants/routes/intents';
import { ACTION_ERROR_INVALID_INTENT } from 'src/lib/constants/routes/errors';

export async function ActionLogout({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent !== INTENT_LOGOUT) {
    // Retornar objeto plain em vez de response
    return {
      error: ACTION_ERROR_INVALID_INTENT
    }
  }

  await ServiceLogout().catch(() => {});

  return redirect('/login');
}
