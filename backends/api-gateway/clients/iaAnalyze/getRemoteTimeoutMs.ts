const DEFAULT_REMOTE_TIMEOUT_MS = 20_000;

/**
 * Retorna o timeout (em ms) para requisições remotas de análise IA.
 *
 * Lê a variável de ambiente IA_ANALYZE_REMOTE_TIMEOUT_MS e valida o valor.
 * Se não for um número válido e positivo, retorna o valor padrão (20s).
 * Útil para ajustar o tempo limite das chamadas remotas sem alterar o código.
 */
export function getRemoteTimeoutMs(): number {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_TIMEOUT_MS ?? '').trim();
  const parsed = Number(rawValue);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return DEFAULT_REMOTE_TIMEOUT_MS;
}