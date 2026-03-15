import type { ActionFunctionArgs } from 'react-router-dom';
import { ServiceRunFeedbackIAAnalysis } from 'src/services/serviceFeedbacks';
import { INTENT_FEEDBACK_RUN_IA } from 'lib/constants/routes/intents';
import { ACTION_ERROR_INVALID_INTENT } from 'lib/constants/routes/errors';
import type { FeedbackInsightScopeType } from 'lib/interfaces/domain/feedback.domain';

type HttpActionError = Error & {
  status?: number;
  code?: string;
};

function parseScopeType(value: FormDataEntryValue | null): FeedbackInsightScopeType | undefined {
  const normalized = String(value ?? '').trim().toUpperCase();

  if (
    normalized === 'COMPANY' ||
    normalized === 'PRODUCT' ||
    normalized === 'SERVICE' ||
    normalized === 'DEPARTMENT'
  ) {
    return normalized;
  }

  return undefined;
}

export async function ActionFeedbackInsightsReport({
  request,
}: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent !== INTENT_FEEDBACK_RUN_IA) {
    return new Response(JSON.stringify({ error: ACTION_ERROR_INVALID_INTENT }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const scope_type = parseScopeType(form.get('scope_type'));
  const catalog_item_id = String(form.get('catalog_item_id') ?? '').trim() || undefined;

  try {
    await ServiceRunFeedbackIAAnalysis({
      scope_type,
      catalog_item_id,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const typedError = error as HttpActionError;

    if (typedError.code === 'insufficient_feedbacks_for_analysis') {
      return new Response(
        JSON.stringify({
          error:
            'Há poucos feedbacks neste contexto para uma análise relevante. É necessário no mínimo 10 feedbacks.',
        }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar insights com IA' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
