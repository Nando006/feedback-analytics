/**
 * Indica se deve tentar fallback para o endpoint local em caso de erro remoto.
 *
 * Lê a variável de ambiente IA_ANALYZE_REMOTE_FALLBACK_LOCAL (default: true).
 * Se for 'false', desativa o fallback. Qualquer outro valor (ou ausência) ativa.
 * Útil para controlar resiliência em ambientes de preview/dev.
 */
export function shouldFallbackToLocal(): boolean {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_FALLBACK_LOCAL ?? 'true')
    .trim()
    .toLowerCase();

  return rawValue !== 'false';
}
