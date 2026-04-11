import {
  analyzeFeedbacksForEnterprise,
  IaAnalyzeServiceError,
  type SupabaseServerClient,
  type IaAnalyzeOptions,
} from './iaAnalyzeService.js';
import type {
  IaAnalyzeRunResponse,
  IaAnalyzeRemoteRunRequest,
} from 'lib/interfaces/contracts/ia-analyze.contract.js';

export type RunIaAnalyzeAnalysisParams = {
  supabase: SupabaseServerClient;
  userId: string;
  options?: IaAnalyzeOptions;
};

type IaAnalyzeExecutionMode = 'local' | 'remote';

const DEFAULT_REMOTE_TIMEOUT_MS = 20_000;

function getExecutionMode(): IaAnalyzeExecutionMode {
  const rawMode = String(process.env.IA_ANALYZE_EXECUTION_MODE ?? 'local')
    .trim()
    .toLowerCase();

  return rawMode === 'remote' ? 'remote' : 'local';
}

function getRemoteBaseUrl(): string | null {
  const rawValue = String(process.env.IA_ANALYZE_REMOTE_URL ?? '').trim();
  if (!rawValue) {
    return null;
  }

  return rawValue.replace(/\/+$/, '');
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

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

async function parseJsonSafe(res: { json: () => Promise<unknown> }) {
  try {
    const payload = (await res.json()) as unknown;
    return isObject(payload) ? payload : null;
  } catch {
    return null;
  }
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

async function runLocalIaAnalyzeAnalysis(
  params: RunIaAnalyzeAnalysisParams,
): Promise<IaAnalyzeRunResponse> {
  return analyzeFeedbacksForEnterprise({
    supabase: params.supabase,
    userId: params.userId,
    options: params.options,
  });
}

async function runRemoteIaAnalyzeAnalysis(
  params: RunIaAnalyzeAnalysisParams,
  remoteBaseUrl: string,
): Promise<IaAnalyzeRunResponse> {
  const endpoint = buildRemoteEndpoint(remoteBaseUrl);
  const timeoutMs = getRemoteTimeoutMs();
  const requestBody: IaAnalyzeRemoteRunRequest = {
    user_id: params.userId,
    options: params.options,
  };
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

  let response: Awaited<ReturnType<typeof fetch>>;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: abortController.signal,
    });
  } catch (error) {
    clearTimeout(timeoutHandle);

    if (shouldFallbackToLocal()) {
      console.warn(
        '[IA Analyze] Falha de rede/timeout no modo remoto. Usando execucao local por fallback.',
        error,
      );

      return runLocalIaAnalyzeAnalysis(params);
    }

    throw new IaAnalyzeServiceError(
      'Failed to call remote IA Analyze',
      502,
      'failed_remote_ia_analyze_request',
    );
  }

  clearTimeout(timeoutHandle);

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    if (shouldFallbackToLocal() && response.status >= 500) {
      console.warn(
        `[IA Analyze] Erro remoto ${response.status}. Usando execucao local por fallback.`,
      );

      return runLocalIaAnalyzeAnalysis(params);
    }

    throw toIaAnalyzeServiceError({
      status: response.status,
      payload,
      defaultCode: 'remote_ia_analyze_error',
      defaultMessage: `Remote IA Analyze returned status ${response.status}`,
    });
  }

  if (!isObject(payload)) {
    throw new IaAnalyzeServiceError(
      'Invalid remote IA Analyze response',
      502,
      'invalid_remote_ia_analyze_response',
    );
  }

  if (typeof payload.analyzedCount !== 'number') {
    throw new IaAnalyzeServiceError(
      'Invalid remote IA Analyze response shape',
      502,
      'invalid_remote_ia_analyze_response_shape',
    );
  }

  return payload as unknown as IaAnalyzeRunResponse;
}

export async function runIaAnalyzeAnalysis(
  params: RunIaAnalyzeAnalysisParams,
): Promise<IaAnalyzeRunResponse> {
  const mode = getExecutionMode();

  if (mode === 'remote') {
    const remoteBaseUrl = getRemoteBaseUrl();

    if (!remoteBaseUrl) {
      if (shouldFallbackToLocal()) {
        console.warn(
          '[IA Analyze] IA_ANALYZE_REMOTE_URL ausente no modo remote. Usando execucao local por fallback.',
        );

        return runLocalIaAnalyzeAnalysis(params);
      } else {
        throw new IaAnalyzeServiceError(
          'Missing IA Analyze remote URL',
          500,
          'missing_ia_analyze_remote_url',
        );
      }
    }

    return runRemoteIaAnalyzeAnalysis(params, remoteBaseUrl);
  }

  return runLocalIaAnalyzeAnalysis(params);
}