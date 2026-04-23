import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';

type HttpError = Error & {
  status?: number;
  code?: string;
};

export async function ActionCollectingData({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const company_objective = String(form.get('company_objective') ?? '');
  const analytics_goal = String(form.get('analytics_goal') ?? '');
  const business_summary = String(form.get('business_summary') ?? '');

  try {
    const collecting = await ServiceUpdateCollectingDataEnterprise({
      company_objective: company_objective || null,
      analytics_goal: analytics_goal || null,
      business_summary: business_summary || null,
    });

    return { ok: true, collecting };
  } catch (error) {
    const httpError = error as HttpError;

    console.error('ActionCollectingData: falha ao salvar coleta', {
      status: httpError?.status,
      code: httpError?.code,
      message: httpError?.message,
    });

    return {
      ok: false,
      error: httpError?.code || 'upsert_failed',
      message: httpError?.message || 'Falha ao salvar dados de coleta.',
    };
  }
}
