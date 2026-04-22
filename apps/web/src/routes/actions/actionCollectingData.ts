import type {
  CatalogItemInput,
  CompanyFeedbackQuestionInput,
} from 'lib/interfaces/entities/enterprise.entity';
import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';

type HttpError = Error & {
  status?: number;
  code?: string;
};

function isTruthyValue(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true' || value === '1';
}

function parseLegacyProductsText(text: string) {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((name, index) => ({
      name,
      description: null,
      sort_order: index,
      status: 'ACTIVE' as const,
    }));
}

function parseCatalogItemsField(
  raw: FormDataEntryValue | null,
): CatalogItemInput[] | undefined {
  if (raw === null) return undefined;

  const text = String(raw ?? '').trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item, index): CatalogItemInput | null => {
        if (typeof item === 'string') {
          const name = item.trim();
          if (!name) return null;
          return {
            name,
            description: null,
            sort_order: index,
            status: 'ACTIVE' as const,
          };
        }

        if (!item || typeof item !== 'object') return null;

        const candidate = item as {
          id?: unknown;
          name?: unknown;
          description?: unknown;
          sort_order?: unknown;
          status?: unknown;
        };

        const name =
          typeof candidate.name === 'string' ? candidate.name.trim() : '';
        if (!name) return null;

        return {
          ...(typeof candidate.id === 'string' && candidate.id.trim()
            ? { id: candidate.id.trim() }
            : {}),
          name,
          description:
            typeof candidate.description === 'string'
              ? candidate.description.trim() || null
              : null,
          sort_order:
            typeof candidate.sort_order === 'number' &&
            Number.isFinite(candidate.sort_order)
              ? candidate.sort_order
              : index,
          status:
            candidate.status === 'INACTIVE' ? 'INACTIVE' : ('ACTIVE' as const),
        };
      })
      .filter((item): item is CatalogItemInput => item !== null);
  } catch {
    return [];
  }
}

function parseCompanyFeedbackQuestionsField(
  raw: FormDataEntryValue | null,
): CompanyFeedbackQuestionInput[] | undefined {
  if (raw === null) return undefined;

  const text = String(raw ?? '').trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .slice(0, 3)
      .map((item, index): CompanyFeedbackQuestionInput | null => {
        if (!item || typeof item !== 'object') return null;

        const candidate = item as {
          question_order?: unknown;
          question_text?: unknown;
          is_active?: unknown;
          subquestions?: unknown;
        };

        const questionOrderRaw = Number(candidate.question_order);
        const question_order =
          Number.isInteger(questionOrderRaw) &&
          questionOrderRaw >= 1 &&
          questionOrderRaw <= 3
            ? (questionOrderRaw as 1 | 2 | 3)
            : ((index + 1) as 1 | 2 | 3);

        const question_text =
          typeof candidate.question_text === 'string'
            ? candidate.question_text.trim()
            : '';

        if (!question_text) return null;

        const subquestions = Array.isArray(candidate.subquestions)
          ? candidate.subquestions
              .slice(0, 3)
              .map((subquestion, subIndex) => {
                if (!subquestion || typeof subquestion !== 'object') {
                  return null;
                }

                const subCandidate = subquestion as {
                  subquestion_order?: unknown;
                  subquestion_text?: unknown;
                  is_active?: unknown;
                };

                const subOrderRaw = Number(subCandidate.subquestion_order);
                const subquestion_order =
                  Number.isInteger(subOrderRaw) &&
                  subOrderRaw >= 1 &&
                  subOrderRaw <= 3
                    ? (subOrderRaw as 1 | 2 | 3)
                    : ((subIndex + 1) as 1 | 2 | 3);

                return {
                  subquestion_order,
                  subquestion_text:
                    typeof subCandidate.subquestion_text === 'string'
                      ? subCandidate.subquestion_text.trim()
                      : '',
                  is_active: subCandidate.is_active === true,
                };
              })
              .filter((subquestion): subquestion is NonNullable<typeof subquestion> => Boolean(subquestion))
          : [];

        return {
          question_order,
          question_text,
          is_active: candidate.is_active === false ? false : true,
          subquestions,
        };
      })
      .filter(
        (item): item is CompanyFeedbackQuestionInput => item !== null,
      );
  } catch {
    return [];
  }
}

export async function ActionCollectingData({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const hasCatalogProductsField =
    form.has('catalog_products') || form.has('main_products_or_services');
  const hasCatalogServicesField = form.has('catalog_services');
  const hasCatalogDepartmentsField = form.has('catalog_departments');

  // Extraindo os valores dos campos do formulário, convertendo-os para string.
  const company_objective = String(form.get('company_objective') ?? '');
  const analytics_goal = String(form.get('analytics_goal') ?? '');
  const business_summary = String(form.get('business_summary') ?? '');
  const main_products_or_services_text = String(
    form.get('main_products_or_services') ?? '',
  );
  const uses_company_products = isTruthyValue(form.get('uses_company_products'));
  const uses_company_services = isTruthyValue(form.get('uses_company_services'));
  const uses_company_departments = isTruthyValue(
    form.get('uses_company_departments'),
  );

  const catalogProductsFromForm = parseCatalogItemsField(
    form.get('catalog_products'),
  );
  const catalogServicesFromForm = parseCatalogItemsField(
    form.get('catalog_services'),
  );
  const catalogDepartmentsFromForm = parseCatalogItemsField(
    form.get('catalog_departments'),
  );
  const companyFeedbackQuestionsFromForm = parseCompanyFeedbackQuestionsField(
    form.get('company_feedback_questions'),
  );

  const legacyProducts = parseLegacyProductsText(main_products_or_services_text);
  const catalog_products = !uses_company_products
    ? []
    : hasCatalogProductsField
      ? (catalogProductsFromForm ?? legacyProducts)
      : undefined;
  const catalog_services = !uses_company_services
    ? []
    : hasCatalogServicesField
      ? (catalogServicesFromForm ?? [])
      : undefined;
  const catalog_departments = !uses_company_departments
    ? []
    : hasCatalogDepartmentsField
      ? (catalogDepartmentsFromForm ?? [])
      : undefined;

  const main_products_or_services = !uses_company_products
    ? null
    : Array.isArray(catalog_products)
      ? (catalog_products
          .map((item) => item.name)
          .filter((name) => name.length > 0))
      : undefined;

  try {
    // Chamando a função ServiceUpdateCollectingDataEnterprise para atualizar os dados do formulário.
    const collecting = await ServiceUpdateCollectingDataEnterprise({
      company_objective: company_objective || null,
      analytics_goal: analytics_goal || null,
      business_summary: business_summary || null,
      ...(main_products_or_services !== undefined
        ? {
            main_products_or_services:
              Array.isArray(main_products_or_services) &&
              main_products_or_services.length > 0
                ? main_products_or_services
                : null,
          }
        : {}),
      uses_company_products,
      uses_company_services,
      uses_company_departments,
      ...(catalog_products !== undefined ? { catalog_products } : {}),
      ...(catalog_services !== undefined ? { catalog_services } : {}),
      ...(catalog_departments !== undefined ? { catalog_departments } : {}),
      ...(companyFeedbackQuestionsFromForm !== undefined
        ? { company_feedback_questions: companyFeedbackQuestionsFromForm }
        : {}),
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
