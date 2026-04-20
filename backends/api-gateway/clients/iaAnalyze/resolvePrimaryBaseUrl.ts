import { getExecutionMode } from "./getExecutionMode";
import { getPreviewAliasBaseUrl } from "./getPreviewAliasBaseUrl";
import { getRemoteBaseUrl } from "./getRemoteBaseUrl";
import { IaAnalyzeServiceError } from '../../errors/iaAnalyze.errors.js';

// URL padrão do serviço IA local, usada como fallback quando não há endpoint remoto configurado.
const DEFAULT_LOCAL_IA_ANALYZE_URL = 'http://localhost:4100';

/**
 * Resolve a base URL principal para chamadas ao serviço de análise IA.
 *
 * - Se o modo for 'remote', exige uma URL remota (direta ou de preview) e lança erro se não houver.
 * - Se o modo for 'local', usa a URL remota se existir, senão cai no fallback local.
 *
 * Útil para alternar entre ambientes (local, preview, produção) sem alterar código.
 */
export function resolvePrimaryBaseUrl(): string {
  const mode = getExecutionMode();
  const remoteBaseUrl = getRemoteBaseUrl();
  const previewAliasBaseUrl = getPreviewAliasBaseUrl();
  const resolvedRemoteBaseUrl = remoteBaseUrl ?? previewAliasBaseUrl;

  if (mode === 'remote') {
    if (!resolvedRemoteBaseUrl) {
      throw new IaAnalyzeServiceError(
        'Missing IA Analyze remote URL',
        500,
        'missing_ia_analyze_remote_url',
      );
    }

    return resolvedRemoteBaseUrl;
  }

  return resolvedRemoteBaseUrl ?? DEFAULT_LOCAL_IA_ANALYZE_URL;
}