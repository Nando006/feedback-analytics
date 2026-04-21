import type { Request, Response } from 'express';
import { API_ERROR_INTERNAL_SERVER_ERROR } from '../../config/errors.js';
import { sendTypedError } from '../../utils/sendTypedError.js';
import type {
  IaAnalyzeRunRequest,
  IaAnalyzeRunResponse,
} from '../../../../../shared/interfaces/contracts/ia-analyze/run.contract.js';
import { analyzeFeedbacksForEnterprise } from '../../services/iaAnalyze.service.js';
import { IaAnalyzeServiceError } from '../../libs/iaAnalyze/errors.js';
import { parseScopeType } from '../../libs/iaAnalyze/parse.js';

/**
 * Controller responsável por orquestrar a análise IA via requisição HTTP.
 *
 * Etapas principais:
 * 1. Extrai e valida parâmetros do corpo da requisição.
 * 2. Chama o serviço de análise IA com os parâmetros recebidos.
 * 3. Retorna o resultado da análise ou erro tipado.
 *
 * Útil para expor a análise IA de feedbacks via API REST, garantindo tratamento de erros e validação de entrada.
 */
export async function sendMessageToIaAnalyzeController(req: Request, res: Response) {
  const supabase = req.supabase!;
  const user = req.user!;
  const body = (req.body ?? {}) as IaAnalyzeRunRequest;

  /**
   * Determina o limite de feedbacks a serem analisados.
   *
   * - Usa o valor enviado no body se for um número > 0.
   * - Caso contrário, deixa como undefined para usar o padrão do serviço.
   *
   * Útil para evitar consultas muito grandes e garantir performance.
   */
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
