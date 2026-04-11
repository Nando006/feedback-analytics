import { ServiceResendConfirmation } from "src/services/serviceAuth";

export async function actionResendConfirmation({ request }: { request: Request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  if (!email || typeof email !== 'string') {
    return {
      ok: false,
      message: 'E-mail inválido.'
    };
  }

  return await ServiceResendConfirmation(email);
}