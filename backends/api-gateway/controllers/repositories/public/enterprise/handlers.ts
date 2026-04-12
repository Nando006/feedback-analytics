import type { Request, Response } from 'express';
import { createSupabaseServerClient } from '../../../../database/supabase.js';
import {
  API_ERROR_ENTERPRISE_ID_REQUIRED,
  API_ERROR_ENTERPRISE_NOT_FOUND,
  API_ERROR_INTERNAL_SERVER_ERROR,
} from 'server/constants/errors';
import { sendTypedError } from 'server/utils/sendTypedError';

export async function getPublicEnterpriseHandler(req: Request, res: Response) {
  const { id } = req.params;
  const collectionPointId = String(req.query.collection_point ?? '').trim();
  const catalogItemId = String(req.query.catalog_item ?? '').trim();

  if (!id) {
    return sendTypedError(res, 400, API_ERROR_ENTERPRISE_ID_REQUIRED);
  }

  const supabase = createSupabaseServerClient(req, res);

  try {
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

    const fetchQuestions = async (
      scopeType: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT',
      catalogItemContextId: string | null,
    ) => {
      let query = supabase
        .from('questions_of_feedbacks')
        .select(
          'id, scope_type, catalog_item_id, question_order, question_text, subquestions:feedback_question_subquestions(id, question_id, subquestion_order, subquestion_text, is_active)',
        )
        .eq('enterprise_id', enterprise.id)
        .eq('scope_type', scopeType)
        .eq('is_active', true)
        .order('question_order', { ascending: true });

      if (scopeType === 'COMPANY') {
        query = query.is('catalog_item_id', null);
      } else {
        query = catalogItemContextId
          ? query.eq('catalog_item_id', catalogItemContextId)
          : query.is('catalog_item_id', null);
      }

      return await query;
    };

    const currentScope: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT' =
      contextItemKind ?? 'COMPANY';

    let { data: questions, error: questionsError } = await fetchQuestions(
      currentScope,
      contextCatalogItemId,
    );

    if (
      !questionsError &&
      currentScope !== 'COMPANY' &&
      (!questions || questions.length < 3)
    ) {
      const fallback = await fetchQuestions('COMPANY', null);
      questions = fallback.data;
      questionsError = fallback.error;
    }

    if (questionsError) {
      console.error('Erro ao buscar perguntas públicas de feedback:', questionsError);
    }

    return res.json({
      id: enterprise.id,
      name: enterprise.name || 'Empresa',
      collection_point_id: contextCollectionPointId,
      catalog_item_id: contextCatalogItemId,
      item_name: contextItemName,
      item_kind: contextItemKind,
      questions: questions ?? [],
    });
  } catch (err) {
    console.error('Erro ao buscar empresa:', err);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}

