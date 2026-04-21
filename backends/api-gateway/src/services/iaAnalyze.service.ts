import { runIaAnalyzeAnalysis } from '../providers/iaAnalyze.provider.js';
import { IaAnalyzeServiceError } from '../libs/iaAnalyze/errors.js';
import {
  fetchAlreadyAnalyzedFeedbackIds,
  fetchAlreadyAnalyzedFeedbacks,
  fetchEnterpriseContextForAnalysis,
  fetchFeedbacksForAnalysis,
  insertFeedbackAnalysisRows,
  upsertFeedbackInsightsReports,
} from '../repositories/iaAnalyze.repository.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IaAnalyzeRemoteRunRequest } from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import type {
  IaAnalyzeRawRunRequest,
  IaAnalyzeRawRunResponse,
  IaAnalyzeRegenerateInsightsRequest,
  IaAnalyzeRegenerateInsightsResponse,
} from '../../../../shared/interfaces/contracts/ia-analyze/run.contract.js';
import type { IaAnalyzeSentiment } from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import { buildEnterpriseContext, buildAnalysisBatches } from '../libs/iaAnalyze/build.js';
import { hasRequiredEnterpriseInfoForAnalysis, MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS } from '../libs/iaAnalyze/rules.js';
import { applyExecutionFilter } from '../libs/iaAnalyze/filter.js';

/**
 * Realiza a análise IA de feedbacks brutos, orquestrando todo o fluxo de validação, filtragem, batching e persistência dos resultados.
 *
 * Etapas principais:
 * 1. Busca contexto da empresa (dados obrigatórios para análise).
 * 2. Busca feedbacks para análise, aplica filtros de execução e valida quantidade mínima.
 * 3. Remove feedbacks já analisados para evitar duplicidade.
 * 4. Monta contexto e lotes para envio ao serviço remoto de IA.
 * 5. Envia para IA, filtra resultados válidos e insere no banco.
 * 6. Retorna quantidade e lista dos feedbacks analisados.
 *
 * Lança erros claros para casos de dados insuficientes ou problemas de processamento.
 *
 * Útil para garantir que apenas feedbacks válidos e inéditos sejam analisados, mantendo integridade e performance.
 */
export async function analyzeRawFeedbacks(params: {
  supabase: SupabaseClient;
  userId: string;
  options?: IaAnalyzeRawRunRequest;
}): Promise<IaAnalyzeRawRunResponse> {
  const { supabase, userId, options } = params;

  const { enterpriseId, collecting, enterpriseName } = await fetchEnterpriseContextForAnalysis({
    supabase,
    userId,
  });

  if (!hasRequiredEnterpriseInfoForAnalysis(collecting)) {
    throw new IaAnalyzeServiceError(
      'collecting_data_required_for_analysis',
      422,
      'collecting_data_required_for_analysis',
    );
  }

  const limit =
    typeof options?.limit === 'number' && options.limit > 0
      ? Math.min(options.limit, 100)
      : 50;

  const feedbacksForAnalysis = await fetchFeedbacksForAnalysis({ supabase, enterpriseId, limit });
  const feedbacksForExecution = applyExecutionFilter(feedbacksForAnalysis, options);

  if (feedbacksForExecution.length === 0) {
    return { analyzedCount: 0, feedbacksAnalyzed: [] };
  }

  if (feedbacksForExecution.length < MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS) {
    throw new IaAnalyzeServiceError(
      'insufficient_feedbacks_for_analysis',
      422,
      'insufficient_feedbacks_for_analysis',
    );
  }

  const alreadyAnalyzedIds = await fetchAlreadyAnalyzedFeedbackIds({
    supabase,
    feedbackIds: feedbacksForExecution.map((f) => f.id),
  });

  const feedbacksToAnalyze = feedbacksForExecution.filter((f) => !alreadyAnalyzedIds.has(f.id));

  if (feedbacksToAnalyze.length === 0) {
    return { analyzedCount: 0, feedbacksAnalyzed: [] };
  }

  const enterpriseContext = buildEnterpriseContext({ enterpriseName, collecting });
  const analysisBatches = buildAnalysisBatches(feedbacksToAnalyze, options);

  if (analysisBatches.length === 0) {
    return { analyzedCount: 0, feedbacksAnalyzed: [] };
  }

  const remotePayload: IaAnalyzeRemoteRunRequest = {
    enterprise_context: enterpriseContext,
    batches: analysisBatches.map((batch) => ({
      scope_type: batch.scopeType,
      catalog_item_id: batch.catalogItemId,
      catalog_item_name: batch.catalogItemName,
      feedbacks: batch.feedbacks,
    })),
  };

  const remoteResult = await runIaAnalyzeAnalysis(remotePayload);

  const validSentimentsSet = new Set<IaAnalyzeSentiment>(['positive', 'negative', 'neutral']);
  const allowedFeedbackIds = new Set(feedbacksToAnalyze.map((f) => f.id));

  const rowsToInsert = remoteResult.analyses
    .filter(
      (item) =>
        typeof item.feedback_id === 'string' &&
        validSentimentsSet.has(item.sentiment) &&
        allowedFeedbackIds.has(item.feedback_id),
    )
    .map((item) => ({
      feedback_id: item.feedback_id,
      sentiment: item.sentiment,
      categories: Array.isArray(item.categories) ? item.categories : [],
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
    }));

  if (rowsToInsert.length === 0) {
    return { analyzedCount: 0, feedbacksAnalyzed: [] };
  }

  const feedbacksAnalyzed = await insertFeedbackAnalysisRows({ supabase, rows: rowsToInsert });

  return { analyzedCount: feedbacksAnalyzed.length, feedbacksAnalyzed };
}

/**
 * Recalcula e atualiza os insights globais e segmentados da IA com base nos feedbacks já analisados.
 *
 * Etapas principais:
 * 1. Busca contexto da empresa (dados obrigatórios para análise).
 * 2. Busca feedbacks já analisados e aplica filtros de execução.
 * 3. Valida quantidade mínima de feedbacks para relevância estatística.
 * 4. Monta contexto e lotes para envio ao serviço remoto de IA.
 * 5. Envia para IA, obtém novos insights/contextos e faz upsert no banco.
 * 6. Retorna insights globais e todos os contextos calculados.
 *
 * Lança erros claros para casos de dados insuficientes ou problemas de processamento.
 *
 * Útil para garantir que relatórios e dashboards estejam sempre atualizados com base na base de feedbacks mais recente.
 */
export async function regenerateFeedbackInsights(params: {
  supabase: SupabaseClient;
  userId: string;
  options?: IaAnalyzeRegenerateInsightsRequest;
}): Promise<IaAnalyzeRegenerateInsightsResponse> {
  const { supabase, userId, options } = params;

  const { enterpriseId, collecting, enterpriseName } = await fetchEnterpriseContextForAnalysis({
    supabase,
    userId,
  });

  if (!hasRequiredEnterpriseInfoForAnalysis(collecting)) {
    throw new IaAnalyzeServiceError(
      'collecting_data_required_for_analysis',
      422,
      'collecting_data_required_for_analysis',
    );
  }

  const analyzedFeedbacks = await fetchAlreadyAnalyzedFeedbacks({ supabase, enterpriseId });
  const feedbacksForExecution = applyExecutionFilter(analyzedFeedbacks, options);

  if (feedbacksForExecution.length === 0) {
    return { globalInsights: null, contexts: [] };
  }

  if (feedbacksForExecution.length < MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS) {
    throw new IaAnalyzeServiceError(
      'insufficient_feedbacks_for_analysis',
      422,
      'insufficient_feedbacks_for_analysis',
    );
  }

  const enterpriseContext = buildEnterpriseContext({ enterpriseName, collecting });
  const analysisBatches = buildAnalysisBatches(feedbacksForExecution, options);

  if (analysisBatches.length === 0) {
    return { globalInsights: null, contexts: [] };
  }

  const remotePayload: IaAnalyzeRemoteRunRequest = {
    enterprise_context: enterpriseContext,
    batches: analysisBatches.map((batch) => ({
      scope_type: batch.scopeType,
      catalog_item_id: batch.catalogItemId,
      catalog_item_name: batch.catalogItemName,
      feedbacks: batch.feedbacks,
    })),
  };

  const remoteResult = await runIaAnalyzeAnalysis(remotePayload);
  const insightsContexts = remoteResult.contexts;

  const globalInsights =
    insightsContexts.find(
      (ctx) => ctx.scope_type === 'COMPANY' && ctx.catalog_item_id === null && ctx.globalInsights,
    )?.globalInsights ?? insightsContexts[0]?.globalInsights ?? null;

  await upsertFeedbackInsightsReports({ supabase, enterpriseId, contexts: insightsContexts });

  return { globalInsights, contexts: insightsContexts };
}
