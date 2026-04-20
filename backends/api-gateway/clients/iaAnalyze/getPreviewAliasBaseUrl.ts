import { normalizeBaseUrl } from "../../lib/iaAnalyze/normalizeBaseUrl.js";

// URL padrão do endpoint de análise IA para ambiente de preview/homologação.
// Usada quando a variável de ambiente não está definida e o deploy é preview.
const DEFAULT_PREVIEW_IA_ANALYZE_ALIAS_URL =
  'https://feedback-analytics-service-ia-analysis-homolog.vercel.app';

/**
 * Retorna a base URL do endpoint de análise IA para ambiente de preview/homologação.
 *
 * Prioriza a variável de ambiente IA_ANALYZE_REMOTE_PREVIEW_ALIAS_URL, se definida.
 * Caso contrário, verifica se o deploy está em ambiente Vercel Preview e retorna a URL padrão.
 * Se não for preview, retorna null (não há endpoint especial para produção/dev).
 */
export function getPreviewAliasBaseUrl(): string | null {
  const fromEnv = normalizeBaseUrl(
    process.env.IA_ANALYZE_REMOTE_PREVIEW_ALIAS_URL ?? '',
  );

  if (fromEnv) {
    return fromEnv;
  }

  const vercelEnv = String(process.env.VERCEL_ENV ?? '')
    .trim()
    .toLowerCase();

  if (vercelEnv !== 'preview') {
    return null;
  }

  return DEFAULT_PREVIEW_IA_ANALYZE_ALIAS_URL;
}