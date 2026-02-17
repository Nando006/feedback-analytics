import type { ActionFunctionArgs } from 'react-router-dom';
import { ServiceRunFeedbackIAAnalysis } from 'src/services/serviceFeedbacks';
import { INTENT_FEEDBACK_RUN_IA } from 'src/routes/constants/intents';
import { ACTION_ERROR_INVALID_INTENT } from 'src/routes/constants/errors';

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

  try {
    await ServiceRunFeedbackIAAnalysis();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar insights com IA' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
