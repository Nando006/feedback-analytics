
import { type ActionFunctionArgs } from 'react-router-dom';
import { ServiceForgotPassword } from 'src/services/serviceAuth';

export async function ActionForgotPassword({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '');

  const result = await ServiceForgotPassword(email);

  return result;
}