/**
 * Monta a URL do endpoint remoto de análise IA.
 *
 * Recebe a base da URL e retorna o caminho completo para o endpoint interno de análise.
 * Útil para centralizar e padronizar a construção da rota de chamada à IA.
 */
export function buildRemoteEndpoint(baseUrl: string): string {
  return `${baseUrl}/internal/ia-analyze/analyze`;
}