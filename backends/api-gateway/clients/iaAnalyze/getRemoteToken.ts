/**
 * Retorna o token de autenticação para requisições remotas de análise IA.
 *
 * Lê a variável de ambiente IA_ANALYZE_REMOTE_TOKEN e valida se está preenchida.
 * Se não houver valor, retorna null (sem token).
 * Útil para proteger endpoints remotos exigindo autenticação.
 */
export function getRemoteToken(): string | null {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_TOKEN ?? '').trim();
  return rawValue.length > 0 ? rawValue : null;
}