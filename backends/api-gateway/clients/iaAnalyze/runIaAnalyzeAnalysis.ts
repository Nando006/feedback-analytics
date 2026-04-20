import type {
  IaAnalyzeRemoteRunRequest,
  IaAnalyzeRemoteRunResponse,
} from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import { postAnalysisToService } from './postAnalysisToService.js';
import { resolvePrimaryBaseUrl } from './resolvePrimaryBaseUrl.js';
import { shouldFallbackToLocal } from './shouldFallbackToLocal.js';

const DEFAULT_LOCAL_IA_ANALYZE_URL = 'http://localhost:4100';

/**
 * Executa a análise IA chamando o serviço remoto (ou local em fallback).
 *
 * Tenta enviar a requisição para o endpoint principal. Se falhar e o fallback estiver habilitado,
 * tenta novamente usando o endpoint local. Lança erro se não for possível executar.
 *
 * Útil para garantir resiliência em ambientes de preview/dev, evitando falhas totais.
 */
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