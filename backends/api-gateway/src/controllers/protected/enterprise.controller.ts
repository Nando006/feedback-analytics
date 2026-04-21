import type { Request, Response } from 'express';
import { enterpriseUpdateSchema } from '../../../../../shared/schemas/user/enterpriseUpdateSchema.js';
import {
  API_ERROR_COLLECTING_DATA_NOT_FOUND,
  API_ERROR_EMPTY_PAYLOAD,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_UPSERT_FAILED,
} from '../../config/errors.js';
import { sendTypedError } from '../../utils/sendTypedError.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CatalogKind as CatalogItemKind } from '../../repositories/collectionPointsQr.repository.js';
import type { CatalogQuestionInput as CompanyFeedbackQuestionInput } from '../../types/catalogQuestion.types.js';

type CatalogItemInput = {
  id?: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  status?: 'ACTIVE' | 'INACTIVE';
};

type NormalizedCompanyFeedbackSubquestion = {
  subquestion_order: 1 | 2 | 3;
  subquestion_text: string;
  is_active: boolean;
};

type NormalizedCompanyFeedbackQuestion = {
  question_order: 1 | 2 | 3;
  question_text: string;
  is_active: boolean;
  subquestionsByOrder: Map<1 | 2 | 3, NormalizedCompanyFeedbackSubquestion>;
};

type CollectingDataPayload = {
  company_objective?: string | null;
  analytics_goal?: string | null;
  business_summary?: string | null;
  main_products_or_services?: string[] | null;
  uses_company_products?: boolean;
  uses_company_services?: boolean;
  uses_company_departments?: boolean;
  catalog_products?: CatalogItemInput[] | null;
  catalog_services?: CatalogItemInput[] | null;
  catalog_departments?: CatalogItemInput[] | null;
  company_feedback_questions?: CompanyFeedbackQuestionInput[] | null;
};

type CatalogItemIdRow = { id: string };

type CatalogItemSnapshotRow = {
  id: string;
  enterprise_id: string;
  kind: string;
  name: string;
  description: string | null;
  status: string;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type CompanyFeedbackSubquestionSnapshotRow = {
  id: string;
  question_id: string;
  subquestion_order: number | string | null;
  subquestion_text: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type CompanyFeedbackQuestionSnapshotRow = {
  id: string;
  enterprise_id: string;
  scope_type: string;
  catalog_item_id: string | null;
  question_order: number | string | null;
  question_text: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  subquestions?: CompanyFeedbackSubquestionSnapshotRow[] | null;
};

const DEFAULT_COMPANY_FEEDBACK_QUESTIONS: CompanyFeedbackQuestionInput[] = [
  { question_order: 1, question_text: 'Como foi sua experiência em relação ao atendimento?', is_active: true, subquestions: [] },
  { question_order: 2, question_text: 'O que você achou da qualidade do produto/serviço?', is_active: true, subquestions: [] },
  { question_order: 3, question_text: 'Como você avalia a relação entre o valor pago e a qualidade do produto/serviço?', is_active: true, subquestions: [] },
];

const MIN_QUESTION_LENGTH = 20;
const MAX_QUESTION_LENGTH = 150;

function hasValidQuestionLength(value: string) {
  return value.length >= MIN_QUESTION_LENGTH && value.length <= MAX_QUESTION_LENGTH;
}

function normalizeCatalogItems(items: CatalogItemInput[] | null | undefined) {
  return (items ?? [])
    .map((item, index) => {
      const name = String(item?.name ?? '').trim();
      if (!name) return null;
      return {
        ...(item?.id ? { id: item.id } : {}),
        name,
        description: item?.description?.trim() || null,
        sort_order: typeof item?.sort_order === 'number' && Number.isFinite(item.sort_order) ? item.sort_order : index,
        status: item?.status === 'INACTIVE' ? 'INACTIVE' : ('ACTIVE' as const),
      };
    })
    .filter((item) => item !== null);
}

async function syncCatalogItemsByKind(params: {
  supabase: SupabaseClient | undefined;
  enterpriseId: string;
  kind: CatalogItemKind;
  items: CatalogItemInput[] | null | undefined;
  disableAll: boolean;
}) {
  const { supabase, enterpriseId, kind, items, disableAll } = params;
  if (!supabase) return { error: true as const };

  if (disableAll) {
    const { error } = await supabase
      .from('catalog_items')
      .update({ status: 'INACTIVE', updated_at: new Date().toISOString() })
      .eq('enterprise_id', enterpriseId)
      .eq('kind', kind)
      .eq('status', 'ACTIVE');
    return { error: Boolean(error) };
  }

  const normalizedItems = normalizeCatalogItems(items);

  const { data: existing, error: existingError } = await supabase
    .from('catalog_items')
    .select('id')
    .eq('enterprise_id', enterpriseId)
    .eq('kind', kind);

  if (existingError) return { error: true as const };

  const existingRows = (existing ?? []) as CatalogItemIdRow[];
  const existingIds = new Set(existingRows.map((row) => row.id));

  const updateRows = normalizedItems
    .filter((item) => item.id && existingIds.has(item.id))
    .map((item) => ({ id: item.id, enterprise_id: enterpriseId, kind, name: item.name, description: item.description, sort_order: item.sort_order, status: item.status, updated_at: new Date().toISOString() }));

  const insertRows = normalizedItems
    .filter((item) => !item.id || !existingIds.has(item.id))
    .map((item) => ({ enterprise_id: enterpriseId, kind, name: item.name, description: item.description, sort_order: item.sort_order, status: item.status }));

  if (updateRows.length > 0) {
    const { error } = await supabase.from('catalog_items').upsert(updateRows, { onConflict: 'id' });
    if (error) return { error: true as const };
  }

  if (insertRows.length > 0) {
    const { error } = await supabase.from('catalog_items').insert(insertRows);
    if (error) return { error: true as const };
  }

  const incomingKnownIds = new Set(
    normalizedItems.map((item) => item.id).filter((id): id is string => typeof id === 'string' && existingIds.has(id)),
  );

  const staleIds = existingRows.map((row) => row.id).filter((id) => !incomingKnownIds.has(id));

  if (staleIds.length > 0) {
    const { error } = await supabase.from('catalog_items').update({ status: 'INACTIVE', updated_at: new Date().toISOString() }).in('id', staleIds);
    if (error) return { error: true as const };
  }

  return { error: false as const };
}

async function getCatalogSnapshot(supabase: SupabaseClient | undefined, enterpriseId: string) {
  if (!supabase) return { catalog_products: [], catalog_services: [], catalog_departments: [] };

  const { data, error } = await supabase
    .from('catalog_items')
    .select('id, enterprise_id, kind, name, description, status, sort_order, created_at, updated_at')
    .eq('enterprise_id', enterpriseId)
    .eq('status', 'ACTIVE')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data) return { catalog_products: [], catalog_services: [], catalog_departments: [] };

  const catalogRows = data as CatalogItemSnapshotRow[];

  return {
    catalog_products: catalogRows.filter((item) => item.kind === 'PRODUCT'),
    catalog_services: catalogRows.filter((item) => item.kind === 'SERVICE'),
    catalog_departments: catalogRows.filter((item) => item.kind === 'DEPARTMENT'),
  };
}

function normalizeCompanyFeedbackQuestions(
  items: CompanyFeedbackQuestionInput[] | null | undefined,
): NormalizedCompanyFeedbackQuestion[] | null {
  const source = Array.isArray(items) && items.length > 0 ? items.slice(0, 3) : DEFAULT_COMPANY_FEEDBACK_QUESTIONS;

  const questionByOrder = new Map<number, NormalizedCompanyFeedbackQuestion>();

  for (let index = 0; index < source.length; index += 1) {
    const item = source[index];
    const questionOrderRaw = Number(item?.question_order);
    const questionOrder =
      Number.isInteger(questionOrderRaw) && questionOrderRaw >= 1 && questionOrderRaw <= 3
        ? (questionOrderRaw as 1 | 2 | 3)
        : ((index + 1) as 1 | 2 | 3);

    if (questionByOrder.has(questionOrder)) return null;

    const questionText = String(item?.question_text ?? '').trim();
    if (!hasValidQuestionLength(questionText)) return null;

    const rawSubquestions = Array.isArray(item?.subquestions) ? item.subquestions.slice(0, 3) : [];
    const subquestionsByOrder = new Map<1 | 2 | 3, NormalizedCompanyFeedbackSubquestion>();

    for (let subIndex = 0; subIndex < rawSubquestions.length; subIndex += 1) {
      const subquestion = rawSubquestions[subIndex];
      if (!subquestion || typeof subquestion !== 'object') return null;

      const subquestionOrderRaw = Number(subquestion.subquestion_order);
      const subquestionOrder =
        Number.isInteger(subquestionOrderRaw) && subquestionOrderRaw >= 1 && subquestionOrderRaw <= 3
          ? (subquestionOrderRaw as 1 | 2 | 3)
          : ((subIndex + 1) as 1 | 2 | 3);

      if (subquestionsByOrder.has(subquestionOrder)) return null;

      const subquestionText = String(subquestion.subquestion_text ?? '').trim();
      const subquestionIsActive = subquestion.is_active === true;

      if (!subquestionText) {
        if (subquestionIsActive) return null;
        continue;
      }

      if (!hasValidQuestionLength(subquestionText)) return null;

      subquestionsByOrder.set(subquestionOrder, {
        subquestion_order: subquestionOrder,
        subquestion_text: subquestionText,
        is_active: subquestionIsActive,
      });
    }

    questionByOrder.set(questionOrder, {
      question_order: questionOrder,
      question_text: questionText,
      is_active: item?.is_active === false ? false : true,
      subquestionsByOrder,
    });
  }

  const orderedQuestions = ([1, 2, 3] as const)
    .map((order) => questionByOrder.get(order))
    .filter((question): question is NormalizedCompanyFeedbackQuestion => Boolean(question));

  if (orderedQuestions.length !== 3) return null;

  return orderedQuestions;
}

async function getCompanyFeedbackQuestionsSnapshot(supabase: SupabaseClient | undefined, enterpriseId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('questions_of_feedbacks')
    .select('id, enterprise_id, scope_type, catalog_item_id, question_order, question_text, is_active, created_at, updated_at, subquestions:feedback_question_subquestions(id, question_id, subquestion_order, subquestion_text, is_active, created_at, updated_at)')
    .eq('enterprise_id', enterpriseId)
    .eq('scope_type', 'COMPANY')
    .is('catalog_item_id', null)
    .order('question_order', { ascending: true })
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const questionRows = data as CompanyFeedbackQuestionSnapshotRow[];

  const normalizedData = questionRows.map((item) => ({
    ...item,
    question_order: Number(item.question_order),
    subquestions: Array.isArray(item.subquestions)
      ? item.subquestions.map((sq) => ({ ...sq, subquestion_order: Number(sq.subquestion_order) })).sort((a, b) => a.subquestion_order - b.subquestion_order)
      : [],
  }));

  const firstByOrder = new Map<number, (typeof normalizedData)[number]>();
  for (const item of normalizedData) {
    if (!firstByOrder.has(item.question_order)) firstByOrder.set(item.question_order, item);
  }

  return Array.from(firstByOrder.values()).sort((a, b) => a.question_order - b.question_order);
}

async function syncCompanyFeedbackQuestions(params: {
  supabase: SupabaseClient | undefined;
  enterpriseId: string;
  items: CompanyFeedbackQuestionInput[] | null | undefined;
}) {
  const { supabase, enterpriseId, items } = params;
  if (!supabase) return { error: true as const };

  const normalizedItems = normalizeCompanyFeedbackQuestions(items);
  if (!normalizedItems || normalizedItems.length !== 3) return { error: true as const };

  for (const item of normalizedItems) {
    const { data: updatedRows, error: updateError } = await supabase
      .from('questions_of_feedbacks')
      .update({ question_text: item.question_text, is_active: item.is_active, updated_at: new Date().toISOString() })
      .eq('enterprise_id', enterpriseId)
      .eq('scope_type', 'COMPANY')
      .is('catalog_item_id', null)
      .eq('question_order', item.question_order)
      .select('id');

    if (updateError) return { error: true as const };

    let questionId = updatedRows?.[0]?.id as string | undefined;

    if (!questionId) {
      const { data: insertedRow, error: insertError } = await supabase
        .from('questions_of_feedbacks')
        .insert({ enterprise_id: enterpriseId, scope_type: 'COMPANY', catalog_item_id: null, question_order: item.question_order, question_text: item.question_text, is_active: item.is_active })
        .select('id')
        .single();

      if (insertError || !insertedRow) return { error: true as const };
      questionId = insertedRow.id as string;
    }

    for (const subquestionOrder of [1, 2, 3] as const) {
      const subquestion = item.subquestionsByOrder.get(subquestionOrder);

      if (!subquestion) {
        const { error: deleteError } = await supabase.from('feedback_question_subquestions').delete().eq('question_id', questionId).eq('subquestion_order', subquestionOrder);
        if (deleteError) return { error: true as const };
        continue;
      }

      const { data: updatedSubRows, error: updateSubError } = await supabase
        .from('feedback_question_subquestions')
        .update({ subquestion_text: subquestion.subquestion_text, is_active: subquestion.is_active, updated_at: new Date().toISOString() })
        .eq('question_id', questionId)
        .eq('subquestion_order', subquestion.subquestion_order)
        .select('id');

      if (updateSubError) return { error: true as const };
      if ((updatedSubRows?.length ?? 0) > 0) continue;

      const { error: insertSubError } = await supabase.from('feedback_question_subquestions').insert({ question_id: questionId, subquestion_order: subquestion.subquestion_order, subquestion_text: subquestion.subquestion_text, is_active: subquestion.is_active });
      if (insertSubError) return { error: true as const };
    }
  }

  return { error: false as const };
}

export async function getEnterpriseController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error } = await supabase
    .from('enterprise')
    .select('id, document, account_type, terms_version, terms_accepted_at, created_at')
    .eq('auth_user_id', user.id)
    .single();

  if (error) return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);

  return res.json({ enterprise, user: { id: user.id, email: user.email ?? null, phone: user.phone ?? null } });
}

export async function patchEnterpriseController(req: Request, res: Response) {
  const parsed = enterpriseUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);

  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterprise, error } = await supabase
    .from('enterprise')
    .update(parsed.data)
    .eq('auth_user_id', user.id)
    .select('id, document, account_type, terms_version, terms_accepted_at, created_at')
    .single();

  if (error) return sendTypedError(res, 401, API_ERROR_ENTERPRISE_NOT_FOUND);

  try {
    await supabase.auth.updateUser({
      data: { phone: null, document: null, account_type: null, terms_version: null, terms_accepted_at: null, email: null, email_verified: null, phone_verified: null },
    });
  } catch (_err) {
    void _err;
  }

  return res.json({ enterprise, user: { id: user.id, email: user.email ?? null, phone: user.phone ?? null } });
}

export async function getCollectingDataController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;

  const { data: enterpriseRow, error: eErr } = await supabase.from('enterprise').select('id').eq('auth_user_id', user.id).single();
  if (eErr || !enterpriseRow) return res.json({ collecting: null });

  const { data: collecting, error: cErr } = await supabase
    .from('collecting_data_enterprise')
    .select('id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, uses_company_services, uses_company_departments, created_at, updated_at')
    .eq('enterprise_id', enterpriseRow.id)
    .maybeSingle();

  if (cErr) return sendTypedError(res, 404, API_ERROR_COLLECTING_DATA_NOT_FOUND);
  if (!collecting) return res.json({ collecting: null });

  const catalog = await getCatalogSnapshot(supabase, enterpriseRow.id);
  const companyFeedbackQuestions = await getCompanyFeedbackQuestionsSnapshot(supabase, enterpriseRow.id);

  return res.json({ collecting: { ...collecting, ...catalog, company_feedback_questions: companyFeedbackQuestions } });
}

export async function patchCollectingDataController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;
  const payload = (req.body ?? {}) as CollectingDataPayload;

  const { data: enterpriseRow, error: eErr } = await supabase.from('enterprise').select('id').eq('auth_user_id', user.id).single();
  if (eErr || !enterpriseRow) return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if ('company_objective' in payload) updateData.company_objective = payload.company_objective;
  if ('analytics_goal' in payload) updateData.analytics_goal = payload.analytics_goal;
  if ('business_summary' in payload) updateData.business_summary = payload.business_summary;
  if ('main_products_or_services' in payload) updateData.main_products_or_services = payload.main_products_or_services;
  if ('uses_company_products' in payload) {
    updateData.uses_company_products = payload.uses_company_products ?? false;
    if (payload.uses_company_products === false) updateData.main_products_or_services = null;
  }
  if ('uses_company_services' in payload) updateData.uses_company_services = payload.uses_company_services ?? false;
  if ('uses_company_departments' in payload) updateData.uses_company_departments = payload.uses_company_departments ?? false;

  const hasCatalogProducts = 'catalog_products' in payload;
  const hasCatalogServices = 'catalog_services' in payload;
  const hasCatalogDepartments = 'catalog_departments' in payload;
  const hasCompanyFeedbackQuestions = 'company_feedback_questions' in payload;

  if (Object.keys(updateData).length === 1 && !hasCatalogProducts && !hasCatalogServices && !hasCatalogDepartments && !hasCompanyFeedbackQuestions) {
    return sendTypedError(res, 400, API_ERROR_EMPTY_PAYLOAD);
  }

  const runSyncs = async (enterpriseId: string) => {
    const results = await Promise.all([
      hasCatalogProducts || payload.uses_company_products === false
        ? syncCatalogItemsByKind({ supabase, enterpriseId, kind: 'PRODUCT', items: payload.catalog_products, disableAll: payload.uses_company_products === false })
        : { error: false as const },
      hasCatalogServices || payload.uses_company_services === false
        ? syncCatalogItemsByKind({ supabase, enterpriseId, kind: 'SERVICE', items: payload.catalog_services, disableAll: payload.uses_company_services === false })
        : { error: false as const },
      hasCatalogDepartments || payload.uses_company_departments === false
        ? syncCatalogItemsByKind({ supabase, enterpriseId, kind: 'DEPARTMENT', items: payload.catalog_departments, disableAll: payload.uses_company_departments === false })
        : { error: false as const },
      hasCompanyFeedbackQuestions
        ? syncCompanyFeedbackQuestions({ supabase, enterpriseId, items: payload.company_feedback_questions })
        : { error: false as const },
    ]);
    return results.some((r) => r.error);
  };

  const { data: updated, error: updErr } = await supabase
    .from('collecting_data_enterprise')
    .update(updateData)
    .eq('enterprise_id', enterpriseRow.id)
    .select('id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, uses_company_services, uses_company_departments, created_at, updated_at')
    .single();

  if (updErr) {
    const insertData = {
      enterprise_id: enterpriseRow.id,
      ...('company_objective' in payload ? { company_objective: payload.company_objective ?? null } : {}),
      ...('analytics_goal' in payload ? { analytics_goal: payload.analytics_goal ?? null } : {}),
      ...('business_summary' in payload ? { business_summary: payload.business_summary ?? null } : {}),
      ...('main_products_or_services' in payload ? { main_products_or_services: payload.uses_company_products === false ? null : payload.main_products_or_services ?? null } : {}),
      ...('uses_company_products' in payload ? { uses_company_products: payload.uses_company_products ?? false } : {}),
      ...('uses_company_services' in payload ? { uses_company_services: payload.uses_company_services ?? false } : {}),
      ...('uses_company_departments' in payload ? { uses_company_departments: payload.uses_company_departments ?? false } : {}),
    };

    const { data, error } = await supabase.from('collecting_data_enterprise').insert(insertData).select('id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, uses_company_services, uses_company_departments, created_at, updated_at').single();
    if (error) return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);

    if (await runSyncs(enterpriseRow.id)) return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);

    const catalog = await getCatalogSnapshot(supabase, enterpriseRow.id);
    const companyFeedbackQuestions = await getCompanyFeedbackQuestionsSnapshot(supabase, enterpriseRow.id);
    return res.json({ collecting: { ...data, ...catalog, company_feedback_questions: companyFeedbackQuestions } });
  }

  if (await runSyncs(enterpriseRow.id)) return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);

  const catalog = await getCatalogSnapshot(supabase, enterpriseRow.id);
  const companyFeedbackQuestions = await getCompanyFeedbackQuestionsSnapshot(supabase, enterpriseRow.id);
  return res.json({ collecting: { ...updated, ...catalog, company_feedback_questions: companyFeedbackQuestions } });
}

export async function upsertCollectingDataController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;
  const payload = (req.body ?? {}) as CollectingDataPayload;

  const { data: enterpriseRow, error: eErr } = await supabase.from('enterprise').select('id').eq('auth_user_id', user.id).single();
  if (eErr || !enterpriseRow) return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);

  const upsertData = {
    enterprise_id: enterpriseRow.id,
    company_objective: payload.company_objective ?? null,
    analytics_goal: payload.analytics_goal ?? null,
    business_summary: payload.business_summary ?? null,
    main_products_or_services: payload.uses_company_products === false ? null : payload.main_products_or_services ?? null,
    uses_company_products: payload.uses_company_products ?? false,
    uses_company_services: payload.uses_company_services ?? false,
    uses_company_departments: payload.uses_company_departments ?? false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('collecting_data_enterprise').upsert(upsertData, { onConflict: 'enterprise_id' }).select('id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, uses_company_services, uses_company_departments, created_at, updated_at').single();
  if (error) return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);

  const [syncProduct, syncService, syncDepartment, syncQuestions] = await Promise.all([
    syncCatalogItemsByKind({ supabase, enterpriseId: enterpriseRow.id, kind: 'PRODUCT', items: payload.catalog_products, disableAll: payload.uses_company_products === false }),
    syncCatalogItemsByKind({ supabase, enterpriseId: enterpriseRow.id, kind: 'SERVICE', items: payload.catalog_services, disableAll: payload.uses_company_services === false }),
    syncCatalogItemsByKind({ supabase, enterpriseId: enterpriseRow.id, kind: 'DEPARTMENT', items: payload.catalog_departments, disableAll: payload.uses_company_departments === false }),
    syncCompanyFeedbackQuestions({ supabase, enterpriseId: enterpriseRow.id, items: payload.company_feedback_questions }),
  ]);

  if (syncProduct.error || syncService.error || syncDepartment.error || syncQuestions.error) {
    return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);
  }

  const catalog = await getCatalogSnapshot(supabase, enterpriseRow.id);
  const companyFeedbackQuestions = await getCompanyFeedbackQuestionsSnapshot(supabase, enterpriseRow.id);
  return res.json({ collecting: { ...data, ...catalog, company_feedback_questions: companyFeedbackQuestions } });
}
