import express from 'express';
import { createSupabaseServerClient } from '../../supabase.js';
import {
  API_ERROR_ENTERPRISE_ID_REQUIRED,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_INTERNAL_SERVER_ERROR,
} from '../../../../../lib/constants/server/errors.js';
import { sendTypedError } from '../../../../../lib/utils/sendTypedError.js';

export function EndpointsEnterprise(app: express.Express) {
  // Busca informações públicas de uma empresa para validação
  app.get('/api/public/enterprise/:id', async (req, res) => {
    const { id } = req.params;
    const collectionPointId = String(req.query.collection_point ?? '').trim();
    const catalogItemId = String(req.query.catalog_item ?? '').trim();

    if (!id) {
      return sendTypedError(res, 400, API_ERROR_ENTERPRISE_ID_REQUIRED);
    }

    const supabase = createSupabaseServerClient(req, res);

    try {
      // Buscar dados básicos da empresa usando a view pública
      const { data: enterprise, error } = await supabase
        .from('enterprise_public')
        .select('id, name')
        .eq('id', id)
        .single();

      if (error || !enterprise) {
        return sendTypedError(res, 404, API_ERROR_ENTERPRISE_NOT_FOUND);
      }

      let contextCollectionPointId: string | null = null;
      let contextCatalogItemId: string | null = null;
      let contextItemName: string | null = null;
      let contextItemKind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' | null = null;

      if (collectionPointId || catalogItemId) {
        const cpContextQuery = supabase
          .from('collection_points')
          .select('id, catalog_item_id, catalog_items(name, kind)')
          .eq('enterprise_id', enterprise.id)
          .eq('type', 'QR_CODE')
          .eq('status', 'ACTIVE');

        if (collectionPointId) {
          cpContextQuery.eq('id', collectionPointId);
        } else {
          cpContextQuery.eq('catalog_item_id', catalogItemId);
        }

        const { data: cpContext } = await cpContextQuery.maybeSingle();

        if (cpContext) {
          const contextItem = Array.isArray(cpContext.catalog_items)
            ? cpContext.catalog_items[0]
            : cpContext.catalog_items;

          contextCollectionPointId = cpContext.id ?? null;
          contextCatalogItemId = cpContext.catalog_item_id ?? null;
          contextItemName = contextItem?.name ?? null;
          contextItemKind =
            contextItem?.kind === 'PRODUCT' ||
            contextItem?.kind === 'SERVICE' ||
            contextItem?.kind === 'DEPARTMENT'
              ? contextItem.kind
              : null;
        }
      }

      return res.json({
        id: enterprise.id,
        name: enterprise.name || 'Empresa',
        collection_point_id: contextCollectionPointId,
        catalog_item_id: contextCatalogItemId,
        item_name: contextItemName,
        item_kind: contextItemKind,
      });
    } catch (err) {
      console.error('Erro ao buscar empresa:', err);
      return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
    }
  });
}
