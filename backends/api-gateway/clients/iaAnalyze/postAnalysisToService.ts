import { isObject } from '../../lib/isObject.js';
import { IaAnalyzeServiceError } from '../../errors/iaAnalyze.errors.js';
import type {
  IaAnalyzeRemoteRunRequest,
  IaAnalyzeRemoteRunResponse,
} from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import { buildRemoteEndpoint } from '../../lib/iaAnalyze/buildRemoteEndpoint.js';
import { getRemoteTimeoutMs } from './getRemoteTimeoutMs.js';
import { getRemoteToken } from './getRemoteToken.js';
import { parseJsonSafe } from '../../lib/iaAnalyze/parseJsonSafe.js';
import { toIaAnalyzeServiceError } from '../../lib/iaAnalyze/toIaAnalyzeServiceError.js';

/**
 * Envia uma requisição POST para o serviço remoto de análise IA.
 *
 * Monta o endpoint, define timeout e token, faz a chamada e trata erros de rede e resposta.
 * Valida o formato do retorno e lança erros padronizados em caso de falha.
 *
 * Útil para centralizar toda a lógica de comunicação com o serviço IA externo.
 */
export async function postAnalysisToService(
  baseUrl: string,
  requestBody: IaAnalyzeRemoteRunRequest,
): Promise<IaAnalyzeRemoteRunResponse> {
  const endpoint = buildRemoteEndpoint(baseUrl);
  const timeoutMs = getRemoteTimeoutMs();
  const remoteToken = getRemoteToken();
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
    throw toIaAnalyzeServiceError({
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