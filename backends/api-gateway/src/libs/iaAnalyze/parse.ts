import type { IaAnalyzeScopeType } from '../../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import { isObject } from '../../utils/isObject.js';

/**
 * Faz o parsing seguro do tipo de escopo recebido, retornando apenas valores válidos.
 *
 * - Normaliza o valor para string maiúscula e compara com os tipos aceitos.
 * - Retorna o tipo válido ('COMPANY', 'PRODUCT', 'SERVICE', 'DEPARTMENT') ou undefined se inválido.
 *
 * Útil para validar e padronizar o tipo de escopo recebido de fontes externas.
 */
export function parseScopeType(value: unknown): IaAnalyzeScopeType | undefined {
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

/**
 * Faz o parsing seguro do corpo JSON de uma resposta HTTP.
 *
 * - Tenta converter o body em objeto usando response.json().
 * - Se não for objeto ou der erro no parsing, retorna null.
 *
 * Útil para evitar exceptions em casos de resposta inválida ou malformada.
 */
export async function parseJsonSafe(response: Response) {
  try {
    const payload = (await response.json()) as unknown;
    return isObject(payload) ? payload : null;
  } catch {
    return null;
  }
}
