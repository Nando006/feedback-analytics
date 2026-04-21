import { isObject } from '../utils/isObject.js';
import { IaAnalyzeServiceError } from '../libs/iaAnalyze/errors.js';
import type {
  IaAnalyzeRemoteRunRequest,
  IaAnalyzeRemoteRunResponse,
} from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import { buildRemoteEndpoint } from '../libs/iaAnalyze/build.js';
import { readFallbackEnabled, readRemoteTimeoutMs, readRemoteToken } from '../libs/iaAnalyze/readEnvs.js';
import { parseJsonSafe } from '../libs/iaAnalyze/parse.js';
import { normalizeIaAnalyzeServiceError } from '../libs/iaAnalyze/normalize.js';
import { resolvePrimaryBaseUrl } from '../libs/iaAnalyze/resolvePrimaryBaseUrl.js';

// URL padrão do serviço IA local, usada como fallback quando o serviço remoto está indisponível.
const DEFAULT_LOCAL_IA_ANALYZE_URL = 'http://localhost:4100';

/**
 * Envia a requisição de análise IA para o serviço remoto e trata a resposta.
 *
 * Etapas principais:
 * 1. Monta endpoint, timeout e headers (incluindo token, se houver).
 * 2. Faz POST para o serviço remoto, abortando se exceder o tempo limite.
 * 3. Se falhar na chamada, lança erro customizado.
 * 4. Valida o shape da resposta e lança erro se inválido ou status não for ok.
 * 5. Retorna o payload já validado como resposta da análise.
 *
 * Útil para centralizar a lógica de comunicação robusta com o serviço IA externo, incluindo timeout, autenticação e validação de resposta.
 */
async function postAnalysisToService(
  baseUrl: string,
  requestBody: IaAnalyzeRemoteRunRequest,
): Promise<IaAnalyzeRemoteRunResponse> {
  const endpoint = buildRemoteEndpoint(baseUrl);
  const timeoutMs = readRemoteTimeoutMs();
  const remoteToken = readRemoteToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (remoteToken) {
    headers['x-ia-analyze-token'] = remoteToken;
  }

  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: abortController.signal,
    });
  } catch {
    clearTimeout(timeoutHandle);
    throw new IaAnalyzeServiceError(
      `Failed to call IA Analyze service at ${baseUrl}`,
      502,
      'failed_remote_ia_analyze_request',
    );
  }

  clearTimeout(timeoutHandle);

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw normalizeIaAnalyzeServiceError({
      status: response.status,
      payload,
      defaultCode: 'remote_ia_analyze_error',
      defaultMessage: `IA Analyze service returned status ${response.status}`,
    });
  }

  if (!isObject(payload) || !Array.isArray(payload.analyses) || !Array.isArray(payload.contexts)) {
    throw new IaAnalyzeServiceError(
      'Invalid remote IA Analyze response shape',
      502,
      'invalid_remote_ia_analyze_response_shape',
    );
  }

  return payload as unknown as IaAnalyzeRemoteRunResponse;
}

/**
 * Executa a análise IA remotamente, com fallback local se necessário.
 *
 * Etapas principais:
 * 1. Tenta enviar a requisição para o serviço IA principal (URL configurada).
 * 2. Se falhar e fallback estiver habilitado, tenta novamente usando o serviço local.
 * 3. Lança erro se ambos falharem.
 *
 * Útil para garantir resiliência: se o serviço remoto estiver indisponível, tenta rodar localmente sem interromper o fluxo.
 */
export async function runIaAnalyzeAnalysis(
  requestBody: IaAnalyzeRemoteRunRequest,
): Promise<IaAnalyzeRemoteRunResponse> {
  const primaryBaseUrl = resolvePrimaryBaseUrl();

  try {
    return await postAnalysisToService(primaryBaseUrl, requestBody);
  } catch (error) {
    const canFallbackToLocal =
      readFallbackEnabled() && primaryBaseUrl !== DEFAULT_LOCAL_IA_ANALYZE_URL;

    if (!canFallbackToLocal) {
      throw error;
    }

    console.warn(
      `[IA Analyze] Falha ao chamar ${primaryBaseUrl}. Tentando fallback local ${DEFAULT_LOCAL_IA_ANALYZE_URL}.`,
    );

    return postAnalysisToService(DEFAULT_LOCAL_IA_ANALYZE_URL, requestBody);
  }
}
