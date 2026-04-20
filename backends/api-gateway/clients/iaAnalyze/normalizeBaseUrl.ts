/**
 * Normaliza uma base URL removendo barras finais e espaços.
 *
 * Se a string estiver vazia ou nula, retorna null.
 * Útil para garantir que URLs fiquem padronizadas antes de montar endpoints.
 */
export function normalizeBaseUrl(rawValue: string): string | null {
  const value = String(rawValue ?? '').trim();

  if (!value) {
    return null;
  }

  return value.replace(/\/+$/, '');
}