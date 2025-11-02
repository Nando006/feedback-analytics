import { ServiceUpdateCollectingDataEnterprise } from 'src/services/ServiceCollectingDataEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';

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
    });

    return new Response(JSON.stringify({ collecting }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'upsert_failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
