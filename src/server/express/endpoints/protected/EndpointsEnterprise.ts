import express from 'express';
import { enterpriseUpdateSchema } from '../../../../../lib/schemas/user/enterpriseUpdateSchema.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  API_ERROR_COLLECTING_DATA_NOT_FOUND,
  API_ERROR_EMPTY_PAYLOAD,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_INVALID_PAYLOAD,
  API_ERROR_UPSERT_FAILED,
} from '../../constants/errors.js';

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
      return res.status(404).json({ error: API_ERROR_ENTERPRISE_NOT_FOUND });
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
      return res.status(400).json({
        error: API_ERROR_INVALID_PAYLOAD,
      });
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
      return res.status(401).json({ error: API_ERROR_ENTERPRISE_NOT_FOUND });
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
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, created_at, updated_at',
        )
        .eq('enterprise_id', enterpriseRow.id)
        .maybeSingle();

      if (cErr) {
        return res.status(404).json({ error: API_ERROR_COLLECTING_DATA_NOT_FOUND });
      }

      return res.json({ collecting });
    },
  );

  // Atualiza os dados de coleta de dados da empresa.
  app.patch(
    '/api/protected/user/collecting_data',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const payload = (req.body ?? {}) as {
        company_objective?: string | null;
        analytics_goal?: string | null;
        business_summary?: string | null;
        main_products_or_services?: string[] | null;
        uses_company_products?: boolean;
      };

      const { data: enterpriseRow, error: eErr } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (eErr || !enterpriseRow) {
        return res.status(404).json({ error: API_ERROR_ENTERPRISE_NOT_FOUND });
      }

      const updateData: {
        updated_at: string;
        company_objective?: string | null;
        analytics_goal?: string | null;
        business_summary?: string | null;
        main_products_or_services?: string[] | null;
        uses_company_products?: boolean;
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

      if (Object.keys(updateData).length === 1) {
        return res.status(400).json({ error: API_ERROR_EMPTY_PAYLOAD });
      }

      const { data: updated, error: updErr } = await supabase
        .from('collecting_data_enterprise')
        .update(updateData)
        .eq('enterprise_id', enterpriseRow.id)
        .select(
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, created_at, updated_at',
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
        };

        const { data, error } = await supabase
          .from('collecting_data_enterprise')
          .insert(insertData)
          .select(
            'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, created_at, updated_at',
          )
          .single();

        if (error) {
          return res.status(400).json({ error: API_ERROR_UPSERT_FAILED });
        }

        return res.json({ collecting: data });
      }

      return res.json({ collecting: updated });
    },
  );

  // Insere ou atualiza os dados de coleta de dados da empresa.
  app.put(
    '/api/protected/user/collecting_data',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const payload = (req.body ?? {}) as {
        company_objective?: string | null;
        analytics_goal?: string | null;
        business_summary?: string | null;
        main_products_or_services?: string[] | null;
        uses_company_products?: boolean;
      };

      const { data: enterpriseRow, error: eErr } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (eErr || !enterpriseRow) {
        return res.status(404).json({ error: API_ERROR_ENTERPRISE_NOT_FOUND });
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
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('collecting_data_enterprise')
        .upsert(upsertData, { onConflict: 'enterprise_id' })
        .select(
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, uses_company_products, created_at, updated_at',
        )
        .single();

      if (error) {
        return res.status(400).json({ error: API_ERROR_UPSERT_FAILED });
      }

      return res.json({ collecting: data });
    },
  );
}
