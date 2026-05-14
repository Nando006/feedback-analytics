import type { Request, Response } from 'express';
import { API_ERROR_INTERNAL_SERVER_ERROR } from '../../config/errors.js';
import { sendTypedError } from '../../utils/sendTypedError.js';
import type {
  IaAnalyzeRawRunRequest,
  IaAnalyzeRawRunResponse,
  IaAnalyzeRegenerateInsightsRequest,
  IaAnalyzeRegenerateInsightsResponse,
} from '../../../../../shared/interfaces/contracts/ia-analyze/run.contract.js';
import {
  analyzeRawFeedbacks,
  regenerateFeedbackInsights,
} from '../../services/iaAnalyze.service.js';
import { IaAnalyzeServiceError } from '../../libs/iaAnalyze/errors.js';
import { parseScopeType } from '../../libs/iaAnalyze/parse.js';

/**
 * Controller responsável por orquestrar a análise IA de feedbacks brutos via requisição HTTP.
 *
 * Etapas principais:
 * 1. Extrai e valida parâmetros do corpo da requisição.
 * 2. Chama o serviço de análise IA para feedbacks brutos.
 * 3. Retorna o resultado da análise ou erro tipado.
 *
 * Útil para expor a análise IA de feedbacks brutos via API REST, garantindo tratamento de erros e validação de entrada.
 */
export async function analyzeRawFeedbacksController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;
  const body = (req.body ?? {}) as IaAnalyzeRawRunRequest;

  const limit =
    typeof body.limit === 'number' && body.limit > 0 ? body.limit : undefined;
  const scope_type = parseScopeType(body.scope_type);
  const catalog_item_id =
    typeof body.catalog_item_id === 'string' && body.catalog_item_id.trim().length > 0
      ? body.catalog_item_id.trim()
      : undefined;

  try {
    const result = await analyzeRawFeedbacks({
      supabase,
      userId: user.id,
      options: { limit, scope_type, catalog_item_id },
    });

    return res.json(result satisfies IaAnalyzeRawRunResponse);
  } catch (error) {
    if (error instanceof IaAnalyzeServiceError) {
      if (error.code === 'invalid_ai_response') {
        console.error('Resposta invalida da IA no analyze-raw:', error);
      }
      return sendTypedError(res, error.statusCode, error.code);
    }

    console.error('Erro inesperado no endpoint analyze-raw:', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Controller responsável por regenerar os insights IA de feedbacks via requisição HTTP.
 *
 * Etapas principais:
 * 1. Extrai e valida parâmetros do corpo da requisição.
 * 2. Chama o serviço para regenerar os insights IA.
 * 3. Retorna o resultado da operação ou erro tipado.
 *
 * Útil para atualizar os insights globais/segmentados de feedbacks via API REST, garantindo tratamento de erros e validação de entrada.
 */
export async function regenerateFeedbackInsightsController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;
  const body = (req.body ?? {}) as IaAnalyzeRegenerateInsightsRequest;

  const scope_type = parseScopeType(body.scope_type);
  const catalog_item_id =
    typeof body.catalog_item_id === 'string' && body.catalog_item_id.trim().length > 0
      ? body.catalog_item_id.trim()
      : undefined;

  try {
    const result = await regenerateFeedbackInsights({
      supabase,
      userId: user.id,
      options: { scope_type, catalog_item_id },
    });

    return res.json(result satisfies IaAnalyzeRegenerateInsightsResponse);
  } catch (error) {
    if (error instanceof IaAnalyzeServiceError) {
      if (error.code === 'invalid_ai_response') {
        console.error('Resposta invalida da IA no regenerate-insights:', error);
      }
      return sendTypedError(res, error.statusCode, error.code);
    }

    console.error('Erro inesperado no endpoint regenerate-insights:', error);
    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}
