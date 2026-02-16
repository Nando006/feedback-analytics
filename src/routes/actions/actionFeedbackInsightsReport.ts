import type { ActionFunctionArgs } from 'react-router-dom';
import { ServiceRunFeedbackIAAnalysis } from 'src/services/serviceFeedbacks';

export async function ActionFeedbackInsightsReport({
  request,
}: ActionFunctionArgs) {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent !== 'run_feedback_ia') {
    return new Response(JSON.stringify({ error: 'invalid_intent' }), {
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
