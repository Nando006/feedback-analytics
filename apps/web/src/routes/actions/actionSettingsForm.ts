import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';
import type { CompanyFeedbackQuestionInput } from 'lib/interfaces/entities/enterprise.entity';

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
                const subquestion_text = typeof subcandidate.subquestion_text === 'string' ? subcandidate.subquestion_text.trim() : '';
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

export async function ActionSettingsForm({ request }: ActionFunctionArgs) {
  const form = await request.formData();

  const payload: Record<string, unknown> = {};

  const company_objective = form.get('company_objective');
  if (company_objective !== null) payload.company_objective = String(company_objective) || null;

  const analytics_goal = form.get('analytics_goal');
  if (analytics_goal !== null) payload.analytics_goal = String(analytics_goal) || null;

  const business_summary = form.get('business_summary');
  if (business_summary !== null) payload.business_summary = String(business_summary) || null;

  const uses_company_products = parseBooleanFormValue(form.get('uses_company_products'));
  if (uses_company_products !== undefined) payload.uses_company_products = uses_company_products;

  const uses_company_services = parseBooleanFormValue(form.get('uses_company_services'));
  if (uses_company_services !== undefined) payload.uses_company_services = uses_company_services;

  const uses_company_departments = parseBooleanFormValue(form.get('uses_company_departments'));
  if (uses_company_departments !== undefined) payload.uses_company_departments = uses_company_departments;

  const company_feedback_questions = parseCompanyFeedbackQuestionsField(
    form.get('company_feedback_questions'),
  );
  if (company_feedback_questions !== undefined) {
    if (company_feedback_questions === null) {
      return { error: 'Perguntas de feedback inválidas.' };
    }
    payload.company_feedback_questions = company_feedback_questions;
  }

  try {
    const collecting = await ServiceUpdateCollectingDataEnterprise(payload);
    return { ok: true, collecting };
  } catch (error) {
    const httpError = error as HttpError;
    return {
      ok: false,
      error: httpError?.code || 'update_failed',
      message: httpError?.message || 'Falha ao salvar dados de configuração.',
    };
  }
}
