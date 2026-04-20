import { normalizeBaseUrl } from "../../lib/iaAnalyze/normalizeBaseUrl.js";

/**
 * Retorna a base URL do endpoint remoto de análise IA.
 *
 * Lê a variável de ambiente IA_ANALYZE_REMOTE_URL e normaliza o valor.
 * Se não estiver definida, retorna null.
 * Útil para configurar o destino das requisições IA sem hardcode.
 */
export function getRemoteBaseUrl(): string | null {
  return normalizeBaseUrl(process.env.IA_ANALYZE_REMOTE_URL ?? '');
}