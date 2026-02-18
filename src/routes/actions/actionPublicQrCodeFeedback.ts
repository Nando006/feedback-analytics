import type { ActionFunctionArgs } from 'react-router-dom';
import { ServiceSubmitQrcodeFeedback } from 'src/services/serviceFeedbackQRCode';

export async function ActionPublicQrCodeFeedback({
  request,
}: ActionFunctionArgs) {
  const form = await request.formData();

  const enterprise_id = String(form.get('enterprise_id') ?? '');
  const message = String(form.get('message') ?? '').trim();
  const rating = Number(form.get('rating') ?? 0);
  const customer_name = String(form.get('customer_name') ?? '').trim();
  const customer_email = String(form.get('customer_email') ?? '').trim();
  const customer_gender_raw = String(form.get('customer_gender') ?? '').trim();

  if (!enterprise_id) {
    return new Response(
      JSON.stringify({ error: 'ID da empresa não encontrado. Verifique o QR Code.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (!rating) {
    return new Response(
      JSON.stringify({ error: 'Por favor, selecione uma avaliação.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (!message) {
    return new Response(
      JSON.stringify({ error: 'Por favor, escreva seu feedback.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    await ServiceSubmitQrcodeFeedback({
      enterprise_id,
      message,
      rating,
      channel: 'QRCODE',
      customer_name: customer_name || undefined,
      customer_email: customer_email || undefined,
      customer_gender: customer_gender_raw
        ? (customer_gender_raw as
            | 'masculino'
            | 'feminino'
            | 'outro'
            | 'prefiro_nao_informar')
        : undefined,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'status' in err &&
      err.status === 409
    ) {
      return new Response(JSON.stringify({ alreadySubmitted: true }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const errorMessage =
      err && typeof err === 'object' && 'message' in err
        ? String(err.message)
        : 'Erro ao enviar feedback. Tente novamente.';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
