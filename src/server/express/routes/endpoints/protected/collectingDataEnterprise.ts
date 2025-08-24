import express from 'express';
import { requireAuth } from 'src/server/express/middleware/auth';

export function CollectingDataEnterprise(app: express.Express) {
  app.get(
    '/api/protected/user/collecting_data',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase;
      const user = req.user;

      const { data: enterpriseRow, error: eErr } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (eErr || !enterpriseRow) {
        return res.status(404).json({ error: 'enterprise_not_found' });
      }

      const { data: collecting, error: cErr } = await supabase
        .from('collecting_data_enterprise')
        .select(
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, created_at, updated_at',
        )
        .eq('enterprise_id', enterpriseRow.id)
        .single();

      if (cErr) {
        return res.status(404).json({ error: 'collecting_data_not_found' });
      }

      return res.json({ collecting });
    },
  );

  app.patch(
    '/api/protected/user/collecting_data',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase;
      const user = req.user;

      const payload = (req.body ?? {}) as {
        company_objective?: string | null;
        analytics_goal?: string | null;
        business_summary?: string | null;
        main_products_or_services?: string[] | null;
      };

      const { data: enterpriseRow, error: eErr } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (eErr || !enterpriseRow) {
        return res.status(404).json({ error: 'enterprise_not_found' });
      }

      const updateData: any = { updated_at: new Date().toISOString() };
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

      if (Object.keys(updateData).length === 1) {
        return res.status(400).json({ error: 'empty_payload' });
      }

      const { data: updated, error: updErr } = await supabase
        .from('collecting_data_enterprise')
        .update(updateData)
        .eq('enterprise_id', enterpriseRow.id)
        .select(
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, created_at, updated_at',
        )
        .single();

      if (updErr) {
        const insertData: any = {
          enterprise_id: enterpriseRow.id,
          ...('company_objective' in payload
            ? { company_objective: payload.company_objective }
            : {}),
          ...('analytics_goal' in payload
            ? { analytics_goal: payload.analytics_goal }
            : {}),
          ...('business_summary' in payload
            ? { business_summary: payload.business_summary }
            : {}),
          ...('main_products_or_services' in payload
            ? {
                main_products_or_services: payload.main_products_or_services,
              }
            : {}),
        };

        const { data, error } = await supabase
          .from('collecting_data_enterprise')
          .insert(insertData)
          .select(
            'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, created_at, updated_at',
          )
          .single();

        if (error) {
          return res.status(400).json({ error: 'upsert_failed' });
        }

        return res.json({ collecting: data });
      }

      return res.json({ collecting: updated });
    },
  );

  app.put(
    '/api/protected/user/collecting_data',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase;
      const user = req.user;

      const payload = (req.body ?? {}) as {
        company_objective?: string | null;
        analytics_goal?: string | null;
        business_summary?: string | null;
        main_products_or_services?: string[] | null;
      };

      const { data: enterpriseRow, error: eErr } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (eErr || !enterpriseRow) {
        return res.status(404).json({ error: 'enterprise_not_found' });
      }

      const upsertData = {
        enterprise_id: enterpriseRow.id,
        company_objective: payload.company_objective ?? null,
        analytics_goal: payload.analytics_goal ?? null,
        business_summary: payload.business_summary ?? null,
        main_products_or_services: payload.main_products_or_services ?? null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('collecting_data_enterprise')
        .upsert(upsertData, { onConflict: 'enterprise_id' })
        .select(
          'id, enterprise_id, company_objective, analytics_goal, business_summary, main_products_or_services, created_at, updated_at',
        )
        .single();

      if (error) {
        return res.status(400).json({ error: 'upsert_failed' });
      }

      return res.json({ collecting: data });
    },
  );
}
