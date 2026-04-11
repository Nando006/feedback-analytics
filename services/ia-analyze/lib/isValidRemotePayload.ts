import { isObject } from './isObject.js';
import type { IaAnalyzeRemoteRunRequest } from '../../../shared/lib/interfaces/contracts/ia-analyze.contract.js';

/**
 * Valida estrutura minima esperada no contrato interno gateway -> servico.
 * Serve para rejeitar requisicoes malformadas antes da execucao do motor de IA.
 */
export function isValidRemotePayload(value: unknown): value is IaAnalyzeRemoteRunRequest {
  if (!isObject(value)) {
    return false;
  }

  if (!isObject(value.enterprise_context)) {
    return false;
  }

  return Array.isArray(value.batches);
}