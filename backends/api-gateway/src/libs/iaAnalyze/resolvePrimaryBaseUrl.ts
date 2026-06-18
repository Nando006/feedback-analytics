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

  // Em runtime serverless (Vercel) não existe IA em localhost. Cair no fallback
  // local apenas mascara a configuração ausente como um 502 genérico de conexão
  // recusada (failed_remote_ia_analyze_request, ao discar localhost:4100). Falha
  // alto e claro para expor o env faltando (IA_ANALYZE_EXECUTION_MODE=remote +
  // IA_ANALYZE_REMOTE_URL) em vez de virar um 502 confuso.
  if (!resolvedRemoteBaseUrl && process.env.VERCEL === '1') {
    throw new IaAnalyzeServiceError(
      'Missing IA Analyze remote URL (serverless runtime requires IA_ANALYZE_REMOTE_URL)',
      500,
      'missing_ia_analyze_remote_url',
    );
  }

  return resolvedRemoteBaseUrl ?? DEFAULT_LOCAL_IA_ANALYZE_URL;
}
