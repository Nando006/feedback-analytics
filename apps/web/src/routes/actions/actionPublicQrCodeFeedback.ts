import type { ActionFunctionArgs } from 'react-router-dom';
import { ServiceSubmitQrcodeFeedback } from 'src/services/serviceFeedbackQRCode';
import { getPublicQrFeedbackErrorMessage } from 'src/lib/utils/publicQrFeedbackErrorMessage';
import {
  PUBLIC_QR_FEEDBACK_ERRORS,
  getPublicQrFeedbackBaseValidationError,
  parsePublicQrAnswersInput,
  parsePublicQrSubanswersInput,
} from 'src/lib/utils/publicQrFeedbackValidation';

type HttpError = Error & {
  status?: number;
  code?: string;
};

export async function ActionPublicQrCodeFeedback({
  request,
}: ActionFunctionArgs) {
  const form = await request.formData();

  const enterprise_id = String(form.get('enterprise_id') ?? '');
  const collection_point_id = String(form.get('collection_point_id') ?? '').trim();
  const catalog_item_id = String(form.get('catalog_item_id') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const rating = Number(form.get('rating') ?? 0);
  const answersRaw = String(form.get('answers') ?? '').trim();
  const subanswersRaw = String(form.get('subanswers') ?? '').trim();
  const customer_name = String(form.get('customer_name') ?? '').trim();
  const customer_email = String(form.get('customer_email') ?? '').trim();
  const customer_gender_raw = String(form.get('customer_gender') ?? '').trim();
  const answers = parsePublicQrAnswersInput(answersRaw);
  const subanswers = parsePublicQrSubanswersInput(subanswersRaw);
  const baseValidationError = getPublicQrFeedbackBaseValidationError({
    enterprise_id,
    rating,
    message,
  });

  if (baseValidationError) {
    return new Response(
      JSON.stringify({ error: baseValidationError }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (!answers) {
    return new Response(
      JSON.stringify({ error: PUBLIC_QR_FEEDBACK_ERRORS.missingAnswers }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  if (!subanswers) {
    return new Response(
      JSON.stringify({ error: PUBLIC_QR_FEEDBACK_ERRORS.missingSubanswers }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    await ServiceSubmitQrcodeFeedback({
      enterprise_id,
      collection_point_id: collection_point_id || undefined,
      catalog_item_id: catalog_item_id || undefined,
      message,
      rating,
      answers,
      subanswers,
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
    const httpError = err as HttpError;
    const status = httpError?.status;
    const code = httpError?.code;

    if (
      status === 409 ||
      code === 'DEVICE_ALREADY_SUBMITTED'
    ) {
      return new Response(JSON.stringify({ alreadySubmitted: true }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const errorMessage = getPublicQrFeedbackErrorMessage({
      status,
      code,
      fallbackMessage:
        err && typeof err === 'object' && 'message' in err
          ? String(err.message)
          : undefined,
    });

    const responseStatus =
      typeof status === 'number' && status >= 400 && status <= 599
        ? status
        : 400;

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: responseStatus,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
