import type { Request, Response } from 'express';
import { API_ERROR_INTERNAL_SERVER_ERROR } from 'server/constants/errors.js';
import { sendTypedError } from 'server/utils/sendTypedError.js';
import type {
  IaAnalyzeRunRequest,
  IaAnalyzeRunResponse,
} from 'lib/interfaces/contracts/ia-analyze/run.contract.js';
import type { IaAnalyzeScopeType } from 'lib/interfaces/contracts/ia-analyze/scope.contract.js';
import {
  analyzeFeedbacksForEnterprise,
  IaAnalyzeServiceError,
} from '../../../services/iaAnalyze/iaAnalyzeService.js';

function parseScopeType(value: unknown): IaAnalyzeScopeType | undefined {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();

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

export async function sendMessageToIaAnalyzeHandler(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;
  const body = (req.body ?? {}) as IaAnalyzeRunRequest;

  const limit =
    typeof body.limit === 'number' && body.limit > 0
      ? body.limit
      : undefined;

  const scope_type = parseScopeType(body.scope_type);
  const catalog_item_id =
    typeof body.catalog_item_id === 'string' &&
    body.catalog_item_id.trim().length > 0
      ? body.catalog_item_id.trim()
      : undefined;

  try {
    const result = await analyzeFeedbacksForEnterprise({
      supabase,
      userId: user.id,
      options: { limit, scope_type, catalog_item_id },
    });

    return res.json(result satisfies IaAnalyzeRunResponse);
  } catch (error) {
    if (error instanceof IaAnalyzeServiceError) {
      if (error.code === 'invalid_ai_response') {
        console.error('Resposta invalida da IA no IA Analyze:', error);
      }

      return sendTypedError(res, error.statusCode, error.code);
    }

    console.error('Erro inesperado no endpoint IA Analyze:', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}

