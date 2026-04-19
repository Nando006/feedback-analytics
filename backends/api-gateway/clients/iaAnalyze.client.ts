import { IaAnalyzeServiceError } from '../errors/iaAnalyze.errors.js';
import type {
  IaAnalyzeRemoteRunRequest,
  IaAnalyzeRemoteRunResponse,
} from '../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import type { IaAnalyzeExecutionMode } from '../types/iaAnalyze.types.js';
import { isObject } from '../lib/isObject.js';

/**
 * Tempo limite padrão (em ms) para aguardar resposta do serviço remoto de IA.
 *
 * Evita que a aplicação fique travada caso o serviço demore ou não responda.
 */
const DEFAULT_REMOTE_TIMEOUT_MS = 20_000;

/**
 * URL padrão do serviço local de análise IA.
 *
 * Usada como fallback ou ambiente de desenvolvimento/teste.
 */
const DEFAULT_LOCAL_IA_ANALYZE_URL = 'http://localhost:4100';

/**
 * URL padrão do serviço de análise IA em ambiente de preview/homologação.
 *
 * Usada automaticamente quando o deploy está em ambiente de preview (ex: Vercel Preview).
 */
const DEFAULT_PREVIEW_IA_ANALYZE_ALIAS_URL =
  'https://feedback-analytics-service-ia-analysis-homolog.vercel.app';

function getExecutionMode(): IaAnalyzeExecutionMode {
  const rawMode = String(process.env.IA_ANALYZE_EXECUTION_MODE ?? 'local')
    .trim()
    .toLowerCase();

  return rawMode === 'remote' ? 'remote' : 'local';
}

function normalizeBaseUrl(rawValue: string): string | null {
  const value = String(rawValue ?? '').trim();

  if (!value) {
    return null;
  }

  return value.replace(/\/+$/, '');
}

function getRemoteBaseUrl(): string | null {
  return normalizeBaseUrl(process.env.IA_ANALYZE_REMOTE_URL ?? '');
}

function getPreviewAliasBaseUrl(): string | null {
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

function getRemoteToken(): string | null {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_TOKEN ?? '').trim();
  return rawValue.length > 0 ? rawValue : null;
}

function shouldFallbackToLocal(): boolean {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_FALLBACK_LOCAL ?? 'true')
    .trim()
    .toLowerCase();

  return rawValue !== 'false';
}

function getRemoteTimeoutMs(): number {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_TIMEOUT_MS ?? '').trim();
  const parsed = Number(rawValue);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return DEFAULT_REMOTE_TIMEOUT_MS;
}

function buildRemoteEndpoint(baseUrl: string): string {
  return `${baseUrl}/internal/ia-analyze/analyze`;
}

function normalizeStatusCode(status: number): number {
  if (status >= 400 && status <= 599) {
    return status;
  }

  return 502;
}

function toIaAnalyzeServiceError(params: {
  status: number;
  payload: Record<string, unknown> | null;
  defaultCode: string;
  defaultMessage: string;
}) {
  const { status, payload, defaultCode, defaultMessage } = params;

  const code =
    typeof payload?.error === 'string' && payload.error.trim().length > 0
      ? payload.error.trim()
      : defaultCode;

  const message =
    typeof payload?.message === 'string' && payload.message.trim().length > 0
      ? payload.message.trim()
      : defaultMessage;

  return new IaAnalyzeServiceError(message, normalizeStatusCode(status), code);
}

function resolvePrimaryBaseUrl(): string {
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

async function parseJsonSafe(response: Response) {
  try {
    const payload = (await response.json()) as unknown;
    return isObject(payload) ? payload : null;
  } catch {
    return null;
  }
}

async function postAnalysisToService(
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

export async function runIaAnalyzeAnalysis(
  requestBody: IaAnalyzeRemoteRunRequest,
): Promise<IaAnalyzeRemoteRunResponse> {
  const primaryBaseUrl = resolvePrimaryBaseUrl();

  try {
    return await postAnalysisToService(primaryBaseUrl, requestBody);
  } catch (error) {
    const canFallbackToLocal =
      shouldFallbackToLocal() && primaryBaseUrl !== DEFAULT_LOCAL_IA_ANALYZE_URL;

    if (!canFallbackToLocal) {
      throw error;
    }

    console.warn(
      `[IA Analyze] Falha ao chamar ${primaryBaseUrl}. Tentando fallback local ${DEFAULT_LOCAL_IA_ANALYZE_URL}.`,
    );

    return postAnalysisToService(DEFAULT_LOCAL_IA_ANALYZE_URL, requestBody);
  }
}
