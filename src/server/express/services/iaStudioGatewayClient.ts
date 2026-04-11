import {
  analyzeFeedbacksForEnterprise,
  IaStudioServiceError,
  type SupabaseServerClient,
  type IaStudioOptions,
} from './iaStudioService.js';
import type { IaStudioRunResponse } from '../../../../lib/interfaces/contracts/ia-studio.contract.js';

export type RunIaStudioAnalysisParams = {
  supabase: SupabaseServerClient;
  userId: string;
  options?: IaStudioOptions;
};

type IaStudioExecutionMode = 'local' | 'remote';

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

function shouldFallbackToLocal(): boolean {
  const rawValue = String(process.env.IA_STUDIO_REMOTE_FALLBACK_LOCAL ?? 'true')
    .trim()
    .toLowerCase();

  if (rawValue === 'false') {
    return false;
  }

  return true;
}

export async function runIaStudioAnalysis(
  params: RunIaStudioAnalysisParams,
): Promise<IaStudioRunResponse> {
  const mode = getExecutionMode();

  // Nesta etapa, o modo remoto ainda nao faz chamada HTTP.
  // Apenas validamos a configuracao para preparar a extracao futura.
  if (mode === 'remote') {
    const remoteBaseUrl = getRemoteBaseUrl();

    if (!remoteBaseUrl) {
      if (shouldFallbackToLocal()) {
        console.warn(
          '[IA Studio] IA_STUDIO_REMOTE_URL ausente no modo remote. Usando execucao local por fallback.',
        );
      } else {
        throw new IaStudioServiceError(
          'Missing IA Studio remote URL',
          500,
          'missing_ia_studio_remote_url',
        );
      }
    } else {
      console.warn(
        `[IA Studio] Modo remoto configurado (${remoteBaseUrl}), usando execucao local temporariamente.`,
      );
    }
  }

  return analyzeFeedbacksForEnterprise({
    supabase: params.supabase,
    userId: params.userId,
    options: params.options,
  });
}