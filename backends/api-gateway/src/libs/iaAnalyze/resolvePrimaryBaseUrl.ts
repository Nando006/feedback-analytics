import { readExecutionMode, readPreviewAliasBaseUrl, readRemoteBaseUrl } from './readEnvs.js';
import { IaAnalyzeServiceError } from './errors.js';

/**
 * URL padrão usada para o serviço IA local durante o desenvolvimento.
 *
 * Utilizada quando o modo é 'local' e não há URL remota configurada.
 */
const DEFAULT_LOCAL_IA_ANALYZE_URL = 'http://localhost:4100';

/**
 * Resolve a URL base principal para o serviço IA, considerando ambiente e variáveis.
 *
 * - Se modo for 'remote', exige uma URL remota (direta ou de preview) e lança erro se não houver.
 * - Se modo for 'local', usa a URL remota se existir, senão cai para localhost.
 *
 * Útil para garantir que a aplicação sempre use o endpoint correto, evitando erros de configuração.
 */
export function resolvePrimaryBaseUrl(): string {
  const mode = readExecutionMode();
  const remoteBaseUrl = readRemoteBaseUrl();
  const previewAliasBaseUrl = readPreviewAliasBaseUrl();
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
