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
import { readExecutionMode } from '../../libs/iaAnalyze/readEnvs.js';
import { resolvePrimaryBaseUrl } from '../../libs/iaAnalyze/resolvePrimaryBaseUrl.js';

/**
 * Loga, de forma estruturada, o contexto de uma falha no fluxo de IA. Inclui o
 * código tipado, o modo de execução, a base URL resolvida e o tempo decorrido —
 * o suficiente para, só pelos logs do Vercel, distinguir as causas de um 502:
 * config remota ausente (baseUrl=localhost / mode=local), timeout do remoto
 * (elapsedMs alto + failed_remote_ia_analyze_request) ou erro do próprio modelo.
 */
function logIaAnalyzeFailure(label: string, startedAt: number, error: unknown) {
  const elapsedMs = Date.now() - startedAt;
  const code = error instanceof IaAnalyzeServiceError ? error.code : 'unexpected_error';
  const statusCode = error instanceof IaAnalyzeServiceError ? error.statusCode : 500;

  let baseUrl = 'unresolved';
  try {
    baseUrl = resolvePrimaryBaseUrl();
  } catch {
    baseUrl = 'unresolved';
  }

  console.error(
    `[ia-analyze:${label}] code=${code} status=${statusCode} mode=${readExecutionMode()} baseUrl=${baseUrl} elapsedMs=${elapsedMs}`,
    error,
  );
}

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

  const startedAt = Date.now();

  try {
    const result = await analyzeRawFeedbacks({
      supabase,
      userId: user.id,
      options: { limit, scope_type, catalog_item_id },
    });

    return res.json(result satisfies IaAnalyzeRawRunResponse);
  } catch (error) {
    logIaAnalyzeFailure('analyze-raw', startedAt, error);

    if (error instanceof IaAnalyzeServiceError) {
      return sendTypedError(res, error.statusCode, error.code);
    }

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
  const force = body.force === true;

  const startedAt = Date.now();

  try {
    const result = await regenerateFeedbackInsights({
      supabase,
      userId: user.id,
      options: { scope_type, catalog_item_id, force },
    });

    return res.json(result satisfies IaAnalyzeRegenerateInsightsResponse);
  } catch (error) {
    logIaAnalyzeFailure('regenerate-insights', startedAt, error);

    if (error instanceof IaAnalyzeServiceError) {
      return sendTypedError(res, error.statusCode, error.code);
    }

    return sendTypedError(res, 500, API_ERROR_INTERNAL_SERVER_ERROR);
  }
}
