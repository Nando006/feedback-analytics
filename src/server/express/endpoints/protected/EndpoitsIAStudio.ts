import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  analyzeFeedbacksForEnterprise,
  IaStudioServiceError,
} from '../../services/iaStudioService.js';
import { API_ERROR_INTERNAL_SERVER_ERROR } from '../../../../../lib/constants/server/errors.js';
import { sendTypedError } from '../../../../../lib/utils/sendTypedError.js';

function parseScopeType(value: unknown) {
  const normalized = String(value ?? '').trim().toUpperCase();

  if (
    normalized === 'COMPANY' ||
    normalized === 'PRODUCT' ||
    normalized === 'SERVICE' ||
    normalized === 'DEPARTMENT'
  ) {
    return normalized;
  }

  return undefined;
}

export function EndpointsIAStudio(app: express.Express) {
  app.post(
    '/api/protected/ia-studio/send-message',
    requireAuth,
    async (req, res) => {
      const supabase = req.supabase!;
      const user = req.user!;

      const limit =
        typeof req.body?.limit === 'number' && req.body.limit > 0
          ? req.body.limit
          : undefined;

      const scope_type = parseScopeType(req.body?.scope_type);
      const catalog_item_id =
        typeof req.body?.catalog_item_id === 'string' &&
        req.body.catalog_item_id.trim().length > 0
          ? req.body.catalog_item_id.trim()
          : undefined;

      try {
        const result = await analyzeFeedbacksForEnterprise({
          supabase,
          userId: user.id,
          options: { limit, scope_type, catalog_item_id },
        });

        return res.json(result);
      } catch (error) {
        if (error instanceof IaStudioServiceError) {
          if (error.code === 'invalid_ai_response') {
            // Se for problema de JSON da IA, vale logar o detalhe se existir no ambiente de logs
            console.error('Resposta inválida da IA no IA Studio:', error);
          }

          return sendTypedError(res, error.statusCode, error.code);
        }

        console.error('Erro inesperado no endpoint IA Studio:', error);
        return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
      }
    },
  );
}