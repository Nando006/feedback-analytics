import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  API_ERROR_COLLECTION_POINT_ERROR,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_UNABLE_TO_ACTIVATE_QR,
  API_ERROR_UNABLE_TO_CREATE_QR_CP,
  API_ERROR_UNABLE_TO_DISABLE_QR,
} from '../../../../../lib/constants/server/errors.js';
import { sendTypedError } from '../../../../../lib/utils/sendTypedError.js';

type CatalogKind = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

function getCatalogKind(value: unknown): CatalogKind | null {
  if (value === 'PRODUCT' || value === 'SERVICE' || value === 'DEPARTMENT') {
    return value;
  }

  return null;
}

export function EndpointsCollectionPointsQRCode(app: express.Express) {
  // Status do QR (se há CP ativo)
  app.get(
    '/api/protected/user/collection-points/qr/status',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(
          res,
          404,
          API_ERROR_ENTERPRISE_NOT_FOUND,
          { active: false },
        );
      }

      const { data: cp, error: cpError } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .is('catalog_item_id', null)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (cpError) {
        return sendTypedError(
          res,
          500,
          API_ERROR_COLLECTION_POINT_ERROR,
          { active: false },
        );
      }

      return res.json({ active: !!cp, id: cp?.id ?? null });
    },
  );

  // Habilitar QR (cria se não existir, ativa se existir)
  app.post(
    '/api/protected/user/collection-points/qr/enable',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(
          res,
          404,
          API_ERROR_ENTERPRISE_NOT_FOUND,
        );
      }

      // Já ativo?
      const { data: activeCP } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .is('catalog_item_id', null)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (activeCP) {
        return res.json({ id: activeCP.id, active: true });
      }

      // Existe algum CP de QR? Ativa-o; senão cria um novo
      const { data: anyCP } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .is('catalog_item_id', null)
        .maybeSingle();

      if (anyCP) {
        const { error: updErr } = await supabase
          .from('collection_points')
          .update({ status: 'ACTIVE', name: 'QR Code' })
          .eq('id', anyCP.id);

        if (updErr) {
          return sendTypedError(
            res,
            500,
            API_ERROR_UNABLE_TO_ACTIVATE_QR,
          );
        }

        return res.json({ id: anyCP.id, active: true });
      }

      const { data: newCP, error: createErr } = await supabase
        .from('collection_points')
        .insert({
          enterprise_id: enterprise.id,
          type: 'QR_CODE',
          status: 'ACTIVE',
          name: 'QR Code',
          catalog_item_id: null,
        })
        .select('id')
        .single();

      if (createErr || !newCP) {
        return sendTypedError(
          res,
          500,
          API_ERROR_UNABLE_TO_CREATE_QR_CP,
        );
      }

      return res.json({ id: newCP.id, active: true });
    },
  );

  // Desabilitar QR (coloca INACTIVE se estiver ativo)
  app.post(
    '/api/protected/user/collection-points/qr/disable',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(
          res,
          404,
          API_ERROR_ENTERPRISE_NOT_FOUND,
        );
      }

      const { data: cp } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .is('catalog_item_id', null)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (!cp) {
        return res.json({ active: false });
      }

      const { error: updErr } = await supabase
        .from('collection_points')
        .update({ status: 'INACTIVE' })
        .eq('id', cp.id);

      if (updErr) {
        return sendTypedError(
          res,
          500,
          API_ERROR_UNABLE_TO_DISABLE_QR,
        );
      }

      return res.json({ active: false });
    },
  );

  app.get(
    '/api/protected/user/collection-points/qr/catalog',
    requireAuth,
    async (req, res) => {
      const kind = getCatalogKind(req.query.kind);
      if (!kind) {
        return sendTypedError(res, 400, API_ERROR_COLLECTION_POINT_ERROR);
      }

      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
      }

      const { data: items, error: itemsError } = await supabase
        .from('catalog_items')
        .select('id, name, description, kind')
        .eq('enterprise_id', enterprise.id)
        .eq('kind', kind)
        .eq('status', 'ACTIVE')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (itemsError) {
        return sendTypedError(res, 500, API_ERROR_COLLECTION_POINT_ERROR);
      }

      if (!items || items.length === 0) {
        return res.json({ items: [] });
      }

      const itemIds = items.map((item) => item.id);
      const { data: points, error: pointsError } = await supabase
        .from('collection_points')
        .select('id, catalog_item_id, status, updated_at, created_at')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .in('catalog_item_id', itemIds)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (pointsError) {
        return sendTypedError(res, 500, API_ERROR_COLLECTION_POINT_ERROR);
      }

      const pointByCatalog = new Map<
        string,
        {
          id: string;
          status: string;
        }
      >();

      for (const point of points ?? []) {
        if (!point.catalog_item_id || pointByCatalog.has(point.catalog_item_id)) {
          continue;
        }

        pointByCatalog.set(point.catalog_item_id, {
          id: point.id,
          status: point.status,
        });
      }

      const responseItems = items.map((item) => {
        const point = pointByCatalog.get(item.id);
        return {
          catalog_item_id: item.id,
          name: item.name,
          description: item.description,
          kind: item.kind,
          active: point?.status === 'ACTIVE',
          collection_point_id: point?.id ?? null,
        };
      });

      return res.json({ items: responseItems });
    },
  );

  app.post(
    '/api/protected/user/collection-points/qr/catalog/enable',
    requireAuth,
    async (req, res) => {
      const catalogItemId = String(req.body?.catalog_item_id ?? '').trim();
      if (!catalogItemId) {
        return sendTypedError(res, 400, API_ERROR_COLLECTION_POINT_ERROR);
      }

      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
      }

      const { data: catalogItem, error: catalogItemError } = await supabase
        .from('catalog_items')
        .select('id, name')
        .eq('id', catalogItemId)
        .eq('enterprise_id', enterprise.id)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (catalogItemError || !catalogItem) {
        return sendTypedError(res, 404, API_ERROR_COLLECTION_POINT_ERROR);
      }

      const { data: activeCP } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .eq('catalog_item_id', catalogItem.id)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (activeCP) {
        return res.json({
          catalog_item_id: catalogItem.id,
          collection_point_id: activeCP.id,
          active: true,
        });
      }

      const { data: anyCP } = await supabase
        .from('collection_points')
        .select('id')
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .eq('catalog_item_id', catalogItem.id)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anyCP) {
        const { error: updErr } = await supabase
          .from('collection_points')
          .update({ status: 'ACTIVE', name: `QR Code - ${catalogItem.name}` })
          .eq('id', anyCP.id);

        if (updErr) {
          return sendTypedError(res, 500, API_ERROR_UNABLE_TO_ACTIVATE_QR);
        }

        return res.json({
          catalog_item_id: catalogItem.id,
          collection_point_id: anyCP.id,
          active: true,
        });
      }

      const { data: newCP, error: createErr } = await supabase
        .from('collection_points')
        .insert({
          enterprise_id: enterprise.id,
          catalog_item_id: catalogItem.id,
          type: 'QR_CODE',
          status: 'ACTIVE',
          name: `QR Code - ${catalogItem.name}`,
        })
        .select('id')
        .single();

      if (createErr || !newCP) {
        return sendTypedError(res, 500, API_ERROR_UNABLE_TO_CREATE_QR_CP);
      }

      return res.json({
        catalog_item_id: catalogItem.id,
        collection_point_id: newCP.id,
        active: true,
      });
    },
  );

  app.post(
    '/api/protected/user/collection-points/qr/catalog/disable',
    requireAuth,
    async (req, res) => {
      const catalogItemId = String(req.body?.catalog_item_id ?? '').trim();
      if (!catalogItemId) {
        return sendTypedError(res, 400, API_ERROR_COLLECTION_POINT_ERROR);
      }

      const supabase = req.supabase!;
      const user = req.user!;

      const { data: enterprise, error: enterpriseError } = await supabase
        .from('enterprise')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (enterpriseError || !enterprise) {
        return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
      }

      const { error: updErr } = await supabase
        .from('collection_points')
        .update({ status: 'INACTIVE' })
        .eq('enterprise_id', enterprise.id)
        .eq('type', 'QR_CODE')
        .eq('catalog_item_id', catalogItemId)
        .eq('status', 'ACTIVE');

      if (updErr) {
        return sendTypedError(res, 500, API_ERROR_UNABLE_TO_DISABLE_QR);
      }

      return res.json({
        catalog_item_id: catalogItemId,
        active: false,
      });
    },
  );
}
