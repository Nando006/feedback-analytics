import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';
import type { CatalogItemInput, CompanyFeedbackQuestionInput } from 'lib/interfaces/entities/enterprise.entity';

type HttpError = Error & {
  status?: number;
  code?: string;
};

function parseBooleanFormValue(raw: FormDataEntryValue | null): boolean | undefined {
  if (raw === null) return undefined;

  const value = String(raw).trim().toLowerCase();
  if (value === 'true' || value === 'on' || value === '1') return true;
  if (value === 'false' || value === 'off' || value === '0') return false;

  return undefined;
}

function parseLineSeparatedValues(raw: FormDataEntryValue | null): string[] | undefined {
  if (raw === null) return undefined;

  const text = String(raw).trim();
  if (!text) return [];

  return text
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCatalogItemsField(raw: FormDataEntryValue | null): CatalogItemInput[] | null | undefined {
  if (raw === null) return undefined;

  const text = String(raw).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map((item, index) => {
        if (!item || typeof item !== 'object') return null;

        const candidate = item as Record<string, unknown>;
        const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
        if (!name) return null;

        const description =
          typeof candidate.description === 'string'
            ? candidate.description.trim() || null
            : null;

        const sort_order =
          typeof candidate.sort_order === 'number' && Number.isFinite(candidate.sort_order)
            ? candidate.sort_order
            : index;

        const status =
          candidate.status === 'INACTIVE' || String(candidate.status ?? '').toUpperCase() === 'INACTIVE'
            ? 'INACTIVE'
            : 'ACTIVE';

        return {
          ...(typeof candidate.id === 'string' && candidate.id.trim() ? { id: candidate.id.trim() } : {}),
          name,
          description,
          sort_order,
          status,
        } as CatalogItemInput;
      })
      .filter((item): item is CatalogItemInput => item !== null);
  } catch {
    return null;
  }
}

function parseCompanyFeedbackQuestionsField(
  raw: FormDataEntryValue | null,
): CompanyFeedbackQuestionInput[] | null | undefined {
  if (raw === null) return undefined;

  const text = String(raw).trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return null;

    return parsed
      .map((item) => {
        if (!item || typeof item !== 'object') return null;

        const candidate = item as Record<string, unknown>;
        const question_order = Number(candidate.question_order);
        const question_text = typeof candidate.question_text === 'string' ? candidate.question_text.trim() : '';
        const is_active = candidate.is_active === true;

        if (!question_text) return null;

        const subquestions = Array.isArray(candidate.subquestions)
          ? candidate.subquestions
              .map((subitem) => {
                if (!subitem || typeof subitem !== 'object') return null;

                const subcandidate = subitem as Record<string, unknown>;
                const subquestion_order = Number(subcandidate.subquestion_order);
                const subquestion_text =
                  typeof subcandidate.subquestion_text === 'string'
                    ? subcandidate.subquestion_text.trim()
                    : '';
                const sub_is_active = subcandidate.is_active === true;

                if (!subquestion_text && sub_is_active) return null;

                return {
                  subquestion_order: Number.isInteger(subquestion_order) ? subquestion_order : 1,
                  subquestion_text,
                  is_active: sub_is_active,
                };
              })
              .filter((sub): sub is NonNullable<typeof sub> => sub !== null)
          : [];

        return {
          question_order: Number.isInteger(question_order) ? question_order : 1,
          question_text,
          is_active,
          subquestions,
        } as CompanyFeedbackQuestionInput;
      })
      .filter((question): question is CompanyFeedbackQuestionInput => question !== null);
  } catch {
    return null;
  }
}

function buildCatalogProductsFromLegacyProducts(products: string[]): CatalogItemInput[] {
  return products.map((name, index) => ({
    name,
    description: null,
    sort_order: index,
    status: 'ACTIVE',
  }));
}

export async function ActionCollectingData({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const company_objective = String(form.get('company_objective') ?? '');
  const analytics_goal = String(form.get('analytics_goal') ?? '');
  const business_summary = String(form.get('business_summary') ?? '');

  const uses_company_products = parseBooleanFormValue(form.get('uses_company_products'));
  const uses_company_services = parseBooleanFormValue(form.get('uses_company_services'));
  const uses_company_departments = parseBooleanFormValue(form.get('uses_company_departments'));
  const main_products_or_services = parseLineSeparatedValues(form.get('main_products_or_services'));
  const catalog_products = parseCatalogItemsField(form.get('catalog_products'));
  const catalog_services = parseCatalogItemsField(form.get('catalog_services'));
  const catalog_departments = parseCatalogItemsField(form.get('catalog_departments'));
  const company_feedback_questions = parseCompanyFeedbackQuestionsField(
    form.get('company_feedback_questions'),
  );

  const payload: Record<string, unknown> = {
    company_objective: company_objective || null,
    analytics_goal: analytics_goal || null,
    business_summary: business_summary || null,
  };

  if (uses_company_products !== undefined) payload.uses_company_products = uses_company_products;
  if (uses_company_services !== undefined) payload.uses_company_services = uses_company_services;
  if (uses_company_departments !== undefined) payload.uses_company_departments = uses_company_departments;

  if (uses_company_products === false) {
    payload.main_products_or_services = null;
    payload.catalog_products = [];
  }

  if (uses_company_services === false) {
    payload.catalog_services = [];
  }

  if (uses_company_departments === false) {
    payload.catalog_departments = [];
  }

  if (catalog_products !== undefined) {
    if (catalog_products === null) {
      return { error: 'Itens de catálogo de produtos inválidos.' };
    }

    payload.catalog_products = catalog_products;
  }

  if (catalog_services !== undefined) {
    if (catalog_services === null) {
      return { error: 'Itens de catálogo de serviços inválidos.' };
    }

    payload.catalog_services = catalog_services;
  }

  if (catalog_departments !== undefined) {
    if (catalog_departments === null) {
      return { error: 'Itens de catálogo de departamentos inválidos.' };
    }

    payload.catalog_departments = catalog_departments;
  }

  if (company_feedback_questions !== undefined) {
    if (company_feedback_questions === null) {
      return { error: 'Perguntas de feedback inválidas.' };
    }

    payload.company_feedback_questions = company_feedback_questions;
  }

  if (catalog_products !== undefined && uses_company_products !== false) {
    payload.main_products_or_services = catalog_products.map((item) => item.name);
  } else if (catalog_products === undefined && main_products_or_services !== undefined && uses_company_products !== false) {
    payload.main_products_or_services = main_products_or_services;

    if (main_products_or_services?.length) {
      payload.catalog_products = buildCatalogProductsFromLegacyProducts(main_products_or_services);
    }
  }

  try {
    const collecting = await ServiceUpdateCollectingDataEnterprise(payload);

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
