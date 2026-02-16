import type { ActionFunctionArgs } from 'react-router-dom';
import {
  ServiceDisableQr,
  ServiceEnableQr,
} from 'src/services/serviceCollectionPoints';

type QrToggleIntent = 'enable' | 'disable';

function getErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'message' in err) {
    return String(err.message);
  }

  return 'Falha ao atualizar o QR Code. Tente novamente.';
}

export async function ActionQrCodeEnterprise({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '') as QrToggleIntent;

  if (intent !== 'enable' && intent !== 'disable') {
    return new Response(JSON.stringify({ error: 'Ação inválida para QR Code.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    if (intent === 'disable') {
      await ServiceDisableQr();
      return new Response(JSON.stringify({ ok: true, active: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await ServiceEnableQr();
    return new Response(JSON.stringify({ ok: true, active: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: getErrorMessage(err) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
