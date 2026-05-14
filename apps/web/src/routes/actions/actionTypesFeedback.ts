import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';

type HttpError = Error & {
  status?: number;
  code?: string;
};

function isTruthyValue(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true' || value === '1';
}

export async function ActionTypesFeedback({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const uses_company_products = isTruthyValue(form.get('uses_company_products'));
  const uses_company_services = isTruthyValue(form.get('uses_company_services'));
  const uses_company_departments = isTruthyValue(form.get('uses_company_departments'));

  try {
    await ServiceUpdateCollectingDataEnterprise({
      uses_company_products,
      uses_company_services,
      uses_company_departments,
    });

    return { ok: true };
  } catch (error) {
    const httpError = error as HttpError;

    console.error('ActionTypesFeedback: falha ao salvar tipos de feedback', {
      status: httpError?.status,
      code: httpError?.code,
      message: httpError?.message,
    });

    return {
      ok: false,
      error: httpError?.code || 'update_failed',
      message: httpError?.message || 'Falha ao salvar tipos de feedback.',
    };
  }
}
