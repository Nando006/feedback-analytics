import express from 'express';
import { enterpriseUpdateSchema } from '../../../../../lib/schemas/user/enterpriseUpdateSchema.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  API_ERROR_COLLECTING_DATA_NOT_FOUND,
  API_ERROR_EMPTY_PAYLOAD,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_UPSERT_FAILED,
} from '../../../../../lib/constants/server/errors.js';
import { sendTypedError } from '../../../../../lib/utils/sendTypedError.js';

type CatalogItemKind = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

type CatalogItemInput = {
  id?: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  status?: 'ACTIVE' | 'INACTIVE';
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
};

function normalizeCatalogItems(items: CatalogItemInput[] | null | undefined) {
  return (items ?? [])
    .map((item, index) => {
      const name = String(item?.name ?? '').trim();
      if (!name) return null;

      return {
        ...(item?.id ? { id: item.id } : {}),
        name,
        description: item?.description?.trim() || null,
        sort_order:
          typeof item?.sort_order === 'number' && Number.isFinite(item.sort_order)
            ? item.sort_order
            : index,
        status: item?.status === 'INACTIVE' ? 'INACTIVE' : ('ACTIVE' as const),
      };
    })
    .filter((item) => item !== null);
}

async function syncCatalogItemsByKind(params: {
  supabase: express.Request['supabase'];
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

  if (existingError) {
    return { error: true as const };
  }

  const existingIds = new Set((existing ?? []).map((row) => row.id));
  const updateRows = normalizedItems
    .filter((item) => item.id && existingIds.has(item.id))
    .map((item) => ({
      id: item.id,
      enterprise_id: enterpriseId,
      kind,
      name: item.name,
      description: item.description,
      sort_order: item.sort_order,
      status: item.status,
      updated_at: new Date().toISOString(),
    }));

  const insertRows = normalizedItems
    .filter((item) => !item.id || !existingIds.has(item.id))
    .map((item) => ({
      enterprise_id: enterpriseId,
      kind,
      name: item.name,
      description: item.description,
      sort_order: item.sort_order,
      status: item.status,
    }));

  if (updateRows.length > 0) {
    const { error } = await supabase.from('catalog_items').upsert(updateRows, {
      onConflict: 'id',
    });
    if (error) return { error: true as const };
  }

  if (insertRows.length > 0) {
    const { error } = await supabase.from('catalog_items').insert(insertRows);
    if (error) return { error: true as const };
  }

  const incomingKnownIds = new Set(
    normalizedItems
      .map((item) => item.id)
      .filter((id): id is string => Boolean(id) && existingIds.has(id)),
  );

  const staleIds = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => !incomingKnownIds.has(id));

  if (staleIds.length > 0) {
    const { error } = await supabase
      .from('catalog_items')
      .update({ status: 'INACTIVE', updated_at: new Date().toISOString() })
      .in('id', staleIds);

    if (error) return { error: true as const };
  }

  return { error: false as const };
}

async function getCatalogSnapshot(
  supabase: express.Request['supabase'],
  enterpriseId: string,
) {
  if (!supabase) {
    return {
      catalog_products: [],
      catalog_services: [],
      catalog_departments: [],
    };
  }

  const { data, error } = await supabase
    .from('catalog_items')
    .select(
      'id, enterprise_id, kind, name, description, status, sort_order, created_at, updated_at',
    )
    .eq('enterprise_id', enterpriseId)
    .eq('status', 'ACTIVE')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data) {
    return {
      catalog_products: [],
      catalog_services: [],
      catalog_departments: [],
    };
  }

  return {
    catalog_products: data.filter((item) => item.kind === 'PRODUCT'),
    catalog_services: data.filter((item) => item.kind === 'SERVICE'),
    catalog_departments: data.filter((item) => item.kind === 'DEPARTMENT'),
  };
}

export function EndpointsEnterprise(app: express.Express) {
  // Busca os dados da empresa.
  app.get('/api/protected/user/enterprise', requireAuth, async (req, res) => {
    const supabase = req.supabase!;
    const user = req.user!;

    const { data: enterprise, error } = await supabase
      .from('enterprise')
      .select(
        'id, document, account_type, terms_version, terms_accepted_at, created_at',
      )
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
    }

    return res.json({
      enterprise,
      user: {
        id: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
      },
    });
  });

  // Atualiza os dados da empresa.
  app.patch('/api/protected/user/enterprise', requireAuth, async (req, res) => {
    const parsed = enterpriseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendTypedError(res, 400, API_ERROR_INVALID_PAYLOAD);
    }

    const supabase = req.supabase!;
    const user = req.user!;

    const { data: enterprise, error } = await supabase
      .from('enterprise')
      .update(parsed.data)
      .eq('auth_user_id', user.id)
      .select(
        'id, document, account_type, terms_version, terms_accepted_at, created_at',
      )
      .single();

    if (error) {
      return sendTypedError(res, 401, API_ERROR_ENTERPRISE_NOT_FOUND);
    }

    try {
      await supabase.auth.updateUser({
        data: {
          phone: null,
          document: null,
          account_type: null,
          terms_version: null,
          terms_accepted_at: null,
          email: null,
          email_verified: null,
          phone_verified: null,
        },
      });
    } catch (_err) {
      void _err;
    }

    return res.json({
      enterprise,
      user: {
        id: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
      },
    });
  });

  // Busca os dados de coleta de dados da empresa.
  app.get(
    '/api/protected/user/collecting_data',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterpriseRow, error: eErr } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (eErr || !enterpriseRow) {
        return res.json({ collecting: null });
      }

      const { data: collecting, error: cErr } = await supabase
        .from('collecting_data_enterprise')
        .select(
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, uses_company_services, uses_company_departments, created_at, updated_at',
        )
        .eq('enterprise_id', enterpriseRow.id)
        .maybeSingle();

      if (cErr) {
        return sendTypedError(res, 404, API_ERROR_COLLECTING_DATA_NOT_FOUND);
      }

      if (!collecting) {
        return res.json({ collecting: null });
      }

      const catalog = await getCatalogSnapshot(supabase, enterpriseRow.id);

      return res.json({ collecting: { ...collecting, ...catalog } });
    },
  );

  // Atualiza os dados de coleta de dados da empresa.
  app.patch(
    '/api/protected/user/collecting_data',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const payload = (req.body ?? {}) as CollectingDataPayload;

      const { data: enterpriseRow, error: eErr } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (eErr || !enterpriseRow) {
        return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
      }

      const updateData: {
        updated_at: string;
        company_objective?: string | null;
        analytics_goal?: string | null;
        business_summary?: string | null;
        main_products_or_services?: string[] | null;
        uses_company_products?: boolean;
        uses_company_services?: boolean;
        uses_company_departments?: boolean;
      } = { updated_at: new Date().toISOString() };
      if (Object.prototype.hasOwnProperty.call(payload, 'company_objective')) {
        updateData.company_objective = payload.company_objective;
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'analytics_goal')) {
        updateData.analytics_goal = payload.analytics_goal;
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'business_summary')) {
        updateData.business_summary = payload.business_summary;
      }
      if (
        Object.prototype.hasOwnProperty.call(
          payload,
          'main_products_or_services',
        )
      ) {
        updateData.main_products_or_services =
          payload.main_products_or_services;
      }
      if (
        Object.prototype.hasOwnProperty.call(payload, 'uses_company_products')
      ) {
        updateData.uses_company_products =
          payload.uses_company_products ?? false;
        if (payload.uses_company_products === false) {
          updateData.main_products_or_services = null;
        }
      }
      if (
        Object.prototype.hasOwnProperty.call(payload, 'uses_company_services')
      ) {
        updateData.uses_company_services =
          payload.uses_company_services ?? false;
      }
      if (
        Object.prototype.hasOwnProperty.call(payload, 'uses_company_departments')
      ) {
        updateData.uses_company_departments =
          payload.uses_company_departments ?? false;
      }

      const hasCatalogProducts = Object.prototype.hasOwnProperty.call(
        payload,
        'catalog_products',
      );
      const hasCatalogServices = Object.prototype.hasOwnProperty.call(
        payload,
        'catalog_services',
      );
      const hasCatalogDepartments = Object.prototype.hasOwnProperty.call(
        payload,
        'catalog_departments',
      );

      if (
        Object.keys(updateData).length === 1 &&
        !hasCatalogProducts &&
        !hasCatalogServices &&
        !hasCatalogDepartments
      ) {
        return sendTypedError(res, 400, API_ERROR_EMPTY_PAYLOAD);
      }

      const { data: updated, error: updErr } = await supabase
        .from('collecting_data_enterprise')
        .update(updateData)
        .eq('enterprise_id', enterpriseRow.id)
        .select(
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, uses_company_services, uses_company_departments, created_at, updated_at',
        )
        .single();

      if (updErr) {
        const insertData: {
          enterprise_id: string;
          company_objective?: string | null;
          analytics_goal?: string | null;
          business_summary?: string | null;
          main_products_or_services?: string[] | null;
          uses_company_products?: boolean;
          uses_company_services?: boolean;
          uses_company_departments?: boolean;
        } = {
          enterprise_id: enterpriseRow.id,
          ...('company_objective' in payload
            ? { company_objective: payload.company_objective ?? null }
            : {}),
          ...('analytics_goal' in payload
            ? { analytics_goal: payload.analytics_goal ?? null }
            : {}),
          ...('business_summary' in payload
            ? { business_summary: payload.business_summary ?? null }
            : {}),
          ...('main_products_or_services' in payload
            ? {
                main_products_or_services:
                  payload.uses_company_products === false
                    ? null
                    : payload.main_products_or_services ?? null,
              }
            : {}),
          ...('uses_company_products' in payload
            ? { uses_company_products: payload.uses_company_products ?? false }
            : {}),
          ...('uses_company_services' in payload
            ? { uses_company_services: payload.uses_company_services ?? false }
            : {}),
          ...('uses_company_departments' in payload
            ? {
                uses_company_departments:
                  payload.uses_company_departments ?? false,
              }
            : {}),
        };

        const { data, error } = await supabase
          .from('collecting_data_enterprise')
          .insert(insertData)
          .select(
            'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, uses_company_services, uses_company_departments, created_at, updated_at',
          )
          .single();

        if (error) {
          return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);
        }

        const syncProductResult =
          hasCatalogProducts || payload.uses_company_products === false
            ? await syncCatalogItemsByKind({
                supabase,
                enterpriseId: enterpriseRow.id,
                kind: 'PRODUCT',
                items: payload.catalog_products,
                disableAll: payload.uses_company_products === false,
              })
            : { error: false as const };

        const syncServiceResult =
          hasCatalogServices || payload.uses_company_services === false
            ? await syncCatalogItemsByKind({
                supabase,
                enterpriseId: enterpriseRow.id,
                kind: 'SERVICE',
                items: payload.catalog_services,
                disableAll: payload.uses_company_services === false,
              })
            : { error: false as const };

        const syncDepartmentResult =
          hasCatalogDepartments || payload.uses_company_departments === false
            ? await syncCatalogItemsByKind({
                supabase,
                enterpriseId: enterpriseRow.id,
                kind: 'DEPARTMENT',
                items: payload.catalog_departments,
                disableAll: payload.uses_company_departments === false,
              })
            : { error: false as const };

        if (
          syncProductResult.error ||
          syncServiceResult.error ||
          syncDepartmentResult.error
        ) {
          return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);
        }

        const catalog = await getCatalogSnapshot(supabase, enterpriseRow.id);

        return res.json({ collecting: { ...data, ...catalog } });
      }

      const syncProductResult =
        hasCatalogProducts || payload.uses_company_products === false
          ? await syncCatalogItemsByKind({
              supabase,
              enterpriseId: enterpriseRow.id,
              kind: 'PRODUCT',
              items: payload.catalog_products,
              disableAll: payload.uses_company_products === false,
            })
          : { error: false as const };

      const syncServiceResult =
        hasCatalogServices || payload.uses_company_services === false
          ? await syncCatalogItemsByKind({
              supabase,
              enterpriseId: enterpriseRow.id,
              kind: 'SERVICE',
              items: payload.catalog_services,
              disableAll: payload.uses_company_services === false,
            })
          : { error: false as const };

      const syncDepartmentResult =
        hasCatalogDepartments || payload.uses_company_departments === false
          ? await syncCatalogItemsByKind({
              supabase,
              enterpriseId: enterpriseRow.id,
              kind: 'DEPARTMENT',
              items: payload.catalog_departments,
              disableAll: payload.uses_company_departments === false,
            })
          : { error: false as const };

      if (
        syncProductResult.error ||
        syncServiceResult.error ||
        syncDepartmentResult.error
      ) {
        return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);
      }

      const catalog = await getCatalogSnapshot(supabase, enterpriseRow.id);

      return res.json({ collecting: { ...updated, ...catalog } });
    },
  );

  // Insere ou atualiza os dados de coleta de dados da empresa.
  app.put(
    '/api/protected/user/collecting_data',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const payload = (req.body ?? {}) as CollectingDataPayload;

      const { data: enterpriseRow, error: eErr } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (eErr || !enterpriseRow) {
        return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
      }

      const upsertData = {
        enterprise_id: enterpriseRow.id,
        company_objective: payload.company_objective ?? null,
        analytics_goal: payload.analytics_goal ?? null,
        business_summary: payload.business_summary ?? null,
        main_products_or_services:
          payload.uses_company_products === false
            ? null
            : payload.main_products_or_services ?? null,
        uses_company_products: payload.uses_company_products ?? false,
        uses_company_services: payload.uses_company_services ?? false,
        uses_company_departments: payload.uses_company_departments ?? false,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('collecting_data_enterprise')
        .upsert(upsertData, { onConflict: 'enterprise_id' })
        .select(
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, uses_company_services, uses_company_departments, created_at, updated_at',
        )
        .single();

      if (error) {
        return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);
      }

      const syncProductResult = await syncCatalogItemsByKind({
        supabase,
        enterpriseId: enterpriseRow.id,
        kind: 'PRODUCT',
        items: payload.catalog_products,
        disableAll: payload.uses_company_products === false,
      });

      const syncServiceResult = await syncCatalogItemsByKind({
        supabase,
        enterpriseId: enterpriseRow.id,
        kind: 'SERVICE',
        items: payload.catalog_services,
        disableAll: payload.uses_company_services === false,
      });

      const syncDepartmentResult = await syncCatalogItemsByKind({
        supabase,
        enterpriseId: enterpriseRow.id,
        kind: 'DEPARTMENT',
        items: payload.catalog_departments,
        disableAll: payload.uses_company_departments === false,
      });

      if (
        syncProductResult.error ||
        syncServiceResult.error ||
        syncDepartmentResult.error
      ) {
        return sendTypedError(res, 400, API_ERROR_UPSERT_FAILED);
      }

      const catalog = await getCatalogSnapshot(supabase, enterpriseRow.id);

      return res.json({ collecting: { ...data, ...catalog } });
    },
  );
}
