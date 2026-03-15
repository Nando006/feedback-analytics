import type { ActionFunctionArgs } from 'react-router-dom';
import { ServiceSubmitQrcodeFeedback } from 'src/services/serviceFeedbackQRCode';
import { getPublicQrFeedbackErrorMessage } from 'lib/utils/publicQrFeedbackErrorMessage';
import type {
  FeedbackAnswerValue,
  FeedbackQuestionAnswerInput,
} from 'lib/interfaces/contracts/qrcode.contract';

type HttpError = Error & {
  status?: number;
  code?: string;
};

const ALLOWED_ANSWER_VALUES: FeedbackAnswerValue[] = [
  'PESSIMO',
  'RUIM',
  'MEDIANA',
  'BOA',
  'OTIMA',
];

function parseAnswersInput(raw: string): FeedbackQuestionAnswerInput[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      return null;
    }

    const normalized = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const candidate = item as {
          question_id?: unknown;
          answer_value?: unknown;
        };

        const questionId =
          typeof candidate.question_id === 'string'
            ? candidate.question_id.trim()
            : '';

        const answerValue =
          typeof candidate.answer_value === 'string'
            ? candidate.answer_value.trim().toUpperCase()
            : '';

        if (
          !questionId ||
          !ALLOWED_ANSWER_VALUES.includes(answerValue as FeedbackAnswerValue)
        ) {
          return null;
        }

        return {
          question_id: questionId,
          answer_value: answerValue as FeedbackAnswerValue,
        };
      })
      .filter(
        (entry): entry is FeedbackQuestionAnswerInput =>
          Boolean(entry?.question_id) && Boolean(entry?.answer_value),
      );

    if (normalized.length !== 3) {
      return null;
    }

    const questionIds = normalized.map((entry) => entry.question_id);
    if (new Set(questionIds).size !== 3) {
      return null;
    }

    return normalized;
  } catch {
    return null;
  }
}

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
  const customer_name = String(form.get('customer_name') ?? '').trim();
  const customer_email = String(form.get('customer_email') ?? '').trim();
  const customer_gender_raw = String(form.get('customer_gender') ?? '').trim();
  const answers = parseAnswersInput(answersRaw);

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

  if (!answers) {
    return new Response(
      JSON.stringify({ error: 'Responda as 3 perguntas antes de enviar.' }),
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
