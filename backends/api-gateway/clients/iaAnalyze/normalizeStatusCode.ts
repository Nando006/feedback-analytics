/**
 * Normaliza o status code HTTP para respostas de erro.
 *
 * Se o status estiver entre 400 e 599, retorna ele mesmo (erro válido).
 * Caso contrário, retorna 502 (Bad Gateway) como fallback.
 * Útil para garantir que respostas de erro sempre tenham um status apropriado.
 */
export function normalizeStatusCode(status: number): number {
  if (status >= 400 && status <= 599) {
    return status;
  }

  return 502;
}