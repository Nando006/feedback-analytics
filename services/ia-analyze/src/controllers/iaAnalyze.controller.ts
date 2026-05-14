import type { Request, Response } from 'express';
import { IaAnalyzeServiceError, runIaAnalyzeService } from '../services/iaAnalyze.service.js';
import { isInternalRequestAuthorized } from '../utils/isInternalRequestAuthorized.js';
import { isValidRemotePayload } from '../validations/iaAnalyze.validation.js';
import type { IaAnalyzeRemoteRunResponse } from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';

/**
 * Controller responsável por receber requisições de análise de feedbacks via IA.
 *
 * - Valida autorização interna e o payload recebido
 * - Chama o serviço principal de análise (runIaAnalyzeService)
 * - Retorna o resultado ou erro apropriado para o cliente
 *
 * Garante respostas HTTP corretas para cada cenário de erro ou sucesso.
 */
export async function analyzeController(req: Request, res: Response) {
  if (!isInternalRequestAuthorized(req)) {
    return res.status(401).json({
      error: 'unauthorized_internal_request',
      message: 'Missing or invalid internal token',
    });
  }

  const body = req.body;

  if (!isValidRemotePayload(body)) {
    return res.status(400).json({
      error: 'invalid_payload',
      message: 'enterprise_context and batches are required',
    });
  }

  try {
    const result = await runIaAnalyzeService(body);

    return res.status(200).json(result satisfies IaAnalyzeRemoteRunResponse);
  } catch (error) {
    if (error instanceof IaAnalyzeServiceError) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
    }

    console.error('[ia-analyze] unexpected error:', error);

    return res.status(500).json({
      error: 'internal_server_error',
      message: 'Unexpected error while processing IA analysis',
    });
  }
}
