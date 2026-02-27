import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';

type HttpError = Error & {
  status?: number;
  code?: string;
};

export async function ActionCollectingData({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  // Extraindo os valores dos campos do formulário, convertendo-os para string.
  const company_objective = String(form.get('company_objective') ?? '');
  const analytics_goal = String(form.get('analytics_goal') ?? '');
  const business_summary = String(form.get('business_summary') ?? '');
  const main_products_or_services_text = String(
    form.get('main_products_or_services') ?? '',
  );
  const uses_company_products_raw = form.get('uses_company_products');
  const uses_company_products =
    uses_company_products_raw === 'on' ||
    uses_company_products_raw === 'true' ||
    uses_company_products_raw === '1';
  const uses_company_services_raw = form.get('uses_company_services');
  const uses_company_services =
    uses_company_services_raw === 'on' ||
    uses_company_services_raw === 'true' ||
    uses_company_services_raw === '1';
  const uses_company_departments_raw = form.get('uses_company_departments');
  const uses_company_departments =
    uses_company_departments_raw === 'on' ||
    uses_company_departments_raw === 'true' ||
    uses_company_departments_raw === '1';

  /* Processando o campo de texto 'main_products_or_services' recebido do formulário,
  separando cada linha, removendo espaços em branco e filtrando linhas vazias,
  para obter um array apenas com os produtos ou serviços preenchidos. */
  const main_products_or_services = uses_company_products
    ? main_products_or_services_text
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  try {
    // Chamando a função ServiceUpdateCollectingDataEnterprise para atualizar os dados do formulário.
    const collecting = await ServiceUpdateCollectingDataEnterprise({
      company_objective: company_objective || null,
      analytics_goal: analytics_goal || null,
      business_summary: business_summary || null,
      main_products_or_services: main_products_or_services.length
        ? main_products_or_services
        : null,
      uses_company_products,
      uses_company_services,
      uses_company_departments,
    });

    return new Response(JSON.stringify({ collecting }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const httpError = error as HttpError;
    const status =
      typeof httpError?.status === 'number' &&
      httpError.status >= 400 &&
      httpError.status <= 599
        ? httpError.status
        : 400;

    console.error('ActionCollectingData: falha ao salvar coleta', {
      status: httpError?.status,
      code: httpError?.code,
      message: httpError?.message,
    });

    return new Response(
      JSON.stringify({
        error: httpError?.code || 'upsert_failed',
        message: httpError?.message || 'Falha ao salvar dados de coleta.',
      }),
      {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
