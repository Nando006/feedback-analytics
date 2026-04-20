import { isObject } from '../../lib/isObject.js';

/**
 * Faz o parse seguro do JSON de uma resposta fetch.
 *
 * Tenta converter a resposta em objeto. Se falhar ou não for objeto, retorna null.
 * Útil para evitar erros de parsing e garantir que só objetos válidos sejam processados.
 */
export async function parseJsonSafe(response: Response) {
  try {
    const payload = (await response.json()) as unknown;
    return isObject(payload) ? payload : null;
  } catch {
    return null;
  }
}