import { isObject } from '../../utils/isObject.js';

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
