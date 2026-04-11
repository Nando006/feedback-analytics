import {
  analyzeFeedbacksForEnterprise,
  IaStudioServiceError,
  type SupabaseServerClient,
  type IaStudioOptions,
} from './iaStudioService.js';
import type {
  IaStudioRunResponse,
  IaStudioRemoteRunRequest,
} from '../../../../lib/interfaces/contracts/ia-studio.contract.js';

export type RunIaStudioAnalysisParams = {
  supabase: SupabaseServerClient;
  userId: string;
  options?: IaStudioOptions;
};

type IaStudioExecutionMode = 'local' | 'remote';

const DEFAULT_REMOTE_TIMEOUT_MS = 20_000;

function getExecutionMode(): IaStudioExecutionMode {
  const rawMode = String(process.env.IA_STUDIO_EXECUTION_MODE ?? 'local')
    .trim()
    .toLowerCase();

  return rawMode === 'remote' ? 'remote' : 'local';
}

function getRemoteBaseUrl(): string | null {
  const rawValue = String(process.env.IA_STUDIO_REMOTE_URL ?? '').trim();
  if (!rawValue) {
    return null;
  }

  return rawValue.replace(/\/+$/, '');
}

function getRemoteToken(): string | null {
  const rawValue = String(process.env.IA_STUDIO_REMOTE_TOKEN ?? '').trim();
  return rawValue.length > 0 ? rawValue : null;
}

function shouldFallbackToLocal(): boolean {
  const rawValue = String(process.env.IA_STUDIO_REMOTE_FALLBACK_LOCAL ?? 'true')
    .trim()
    .toLowerCase();

  return rawValue !== 'false';
}

function getRemoteTimeoutMs(): number {
  const rawValue = String(process.env.IA_STUDIO_REMOTE_TIMEOUT_MS ?? '').trim();
  const parsed = Number(rawValue);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return DEFAULT_REMOTE_TIMEOUT_MS;
}

function buildRemoteEndpoint(baseUrl: string): string {
  return `${baseUrl}/internal/ia-studio/analyze`;
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

function toIaStudioServiceError(params: {
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

  return new IaStudioServiceError(message, normalizeStatusCode(status), code);
}

async function runLocalIaStudioAnalysis(
  params: RunIaStudioAnalysisParams,
): Promise<IaStudioRunResponse> {
  return analyzeFeedbacksForEnterprise({
    supabase: params.supabase,
    userId: params.userId,
    options: params.options,
  });
}

async function runRemoteIaStudioAnalysis(
  params: RunIaStudioAnalysisParams,
  remoteBaseUrl: string,
): Promise<IaStudioRunResponse> {
  const endpoint = buildRemoteEndpoint(remoteBaseUrl);
  const timeoutMs = getRemoteTimeoutMs();
  const requestBody: IaStudioRemoteRunRequest = {
    user_id: params.userId,
    options: params.options,
  };
  const remoteToken = getRemoteToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (remoteToken) {
    headers['x-ia-studio-token'] = remoteToken;
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
        '[IA Studio] Falha de rede/timeout no modo remoto. Usando execucao local por fallback.',
        error,
      );

      return runLocalIaStudioAnalysis(params);
    }

    throw new IaStudioServiceError(
      'Failed to call remote IA Studio',
      502,
      'failed_remote_ia_studio_request',
    );
  }

  clearTimeout(timeoutHandle);

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    if (shouldFallbackToLocal() && response.status >= 500) {
      console.warn(
        `[IA Studio] Erro remoto ${response.status}. Usando execucao local por fallback.`,
      );

      return runLocalIaStudioAnalysis(params);
    }

    throw toIaStudioServiceError({
      status: response.status,
      payload,
      defaultCode: 'remote_ia_studio_error',
      defaultMessage: `Remote IA Studio returned status ${response.status}`,
    });
  }

  if (!isObject(payload)) {
    throw new IaStudioServiceError(
      'Invalid remote IA Studio response',
      502,
      'invalid_remote_ia_studio_response',
    );
  }

  if (typeof payload.analyzedCount !== 'number') {
    throw new IaStudioServiceError(
      'Invalid remote IA Studio response shape',
      502,
      'invalid_remote_ia_studio_response_shape',
    );
  }

  return payload as unknown as IaStudioRunResponse;
}

export async function runIaStudioAnalysis(
  params: RunIaStudioAnalysisParams,
): Promise<IaStudioRunResponse> {
  const mode = getExecutionMode();

  if (mode === 'remote') {
    const remoteBaseUrl = getRemoteBaseUrl();

    if (!remoteBaseUrl) {
      if (shouldFallbackToLocal()) {
        console.warn(
          '[IA Studio] IA_STUDIO_REMOTE_URL ausente no modo remote. Usando execucao local por fallback.',
        );

        return runLocalIaStudioAnalysis(params);
      } else {
        throw new IaStudioServiceError(
          'Missing IA Studio remote URL',
          500,
          'missing_ia_studio_remote_url',
        );
      }
    }

    return runRemoteIaStudioAnalysis(params, remoteBaseUrl);
  }

  return runLocalIaStudioAnalysis(params);
}