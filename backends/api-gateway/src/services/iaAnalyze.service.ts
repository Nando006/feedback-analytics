import { runIaAnalyzeAnalysis } from '../providers/iaAnalyze.provider.js';
import { IaAnalyzeServiceError } from '../libs/iaAnalyze/errors.js';
import {
  fetchAlreadyAnalyzedFeedbackIds,
  fetchEnterpriseContextForAnalysis,
  fetchFeedbacksForAnalysis,
  insertFeedbackAnalysisRows,
  upsertFeedbackInsightsReports,
} from '../repositories/iaAnalyze.repository.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IaAnalyzeRemoteRunRequest } from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import type {
  IaAnalyzeRunRequest,
  IaAnalyzeRunResponse,
} from '../../../../shared/interfaces/contracts/ia-analyze/run.contract.js';
import type { IaAnalyzeSentiment } from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import { buildEnterpriseContext, buildAnalysisBatches } from '../libs/iaAnalyze/build.js';
import { hasRequiredEnterpriseInfoForAnalysis, MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS } from '../libs/iaAnalyze/rules.js';
import { applyExecutionFilter } from '../libs/iaAnalyze/filter.js';

/**
 * Realiza o fluxo completo de análise IA para feedbacks de uma empresa.
 *
 * Etapas principais:
 * 1. Busca contexto da empresa e valida pré-requisitos.
 * 2. Busca feedbacks a analisar (limitado e filtrado).
 * 3. Garante quantidade mínima de feedbacks.
 * 4. Remove feedbacks já analisados.
 * 5. Monta contexto e batches para envio à IA.
 * 6. Chama o serviço IA remoto e valida resultados.
 * 7. Insere análises e insights no banco.
 * 8. Retorna resumo da análise realizada.
 *
 * Lança erros específicos para casos de dados insuficientes ou problemas de configuração.
 *
 * Útil para orquestrar todo o ciclo de análise, garantindo robustez e clareza no fluxo.
 */
export async function analyzeFeedbacksForEnterprise(params: {
  supabase: SupabaseClient;
  userId: string;
  options?: IaAnalyzeRunRequest;
}): Promise<IaAnalyzeRunResponse> {
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

  /**
   * Determina o limite de feedbacks a serem buscados para análise.
   *
   * - Usa options.limit se for número > 0, limitado a 100.
   * - Se não informado, usa 50 como padrão.
   *
   * Ajuda a evitar consultas muito grandes e garante performance.
   */
  const limit =
    typeof options?.limit === 'number' && options.limit > 0
      ? Math.min(options.limit, 100)
      : 50;

  const feedbacksForAnalysis = await fetchFeedbacksForAnalysis({
    supabase,
    enterpriseId,
    limit,
  });

  const feedbacksForExecution = applyExecutionFilter(feedbacksForAnalysis, options);

  if (feedbacksForExecution.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: null,
      contexts: [],
    };
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
    feedbackIds: feedbacksForExecution.map((feedback) => feedback.id),
  });

  /**
   * Filtra apenas os feedbacks que ainda não possuem análise IA salva.
   *
   * - Remove feedbacks já analisados, garantindo que não sejam reprocessados.
   * - Usa o Set de IDs já analisados para alta performance.
   *
   * Útil para evitar duplicidade de análises e garantir idempotência do fluxo.
   */
  const feedbacksToAnalyze = feedbacksForExecution.filter(
    (feedback) => !alreadyAnalyzedIds.has(feedback.id),
  );

  if (feedbacksToAnalyze.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: null,
      contexts: [],
    };
  }

  const enterpriseContext = buildEnterpriseContext({
    enterpriseName,
    collecting,
  });

  const analysisBatches = buildAnalysisBatches(feedbacksToAnalyze, options);

  if (analysisBatches.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights: null,
      contexts: [],
    };
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

  const validSentiments: IaAnalyzeSentiment[] = ['positive', 'negative', 'neutral'];
  const validSentimentsSet = new Set(validSentiments);
  const allowedFeedbackIds = new Set(feedbacksToAnalyze.map((feedback) => feedback.id));

  const rowsByFeedbackId = new Map<
    string,
    {
      feedback_id: string;
      sentiment: IaAnalyzeSentiment;
      categories: string[];
      keywords: string[];
    }
  >();

  remoteResult.analyses.forEach((item) => {
    if (
      typeof item.feedback_id !== 'string' ||
      !validSentimentsSet.has(item.sentiment) ||
      !allowedFeedbackIds.has(item.feedback_id)
    ) {
      return;
    }

    rowsByFeedbackId.set(item.feedback_id, {
      feedback_id: item.feedback_id,
      sentiment: item.sentiment,
      categories: Array.isArray(item.categories) ? item.categories : [],
      keywords: Array.isArray(item.keywords) ? item.keywords : [],
    });
  });

  const rowsToInsert = Array.from(rowsByFeedbackId.values());
  const insightsContexts = remoteResult.contexts;

  const globalInsights =
    insightsContexts.find(
      (context) =>
        context.scope_type === 'COMPANY' &&
        context.catalog_item_id === null &&
        context.globalInsights,
    )?.globalInsights ?? insightsContexts[0]?.globalInsights ?? null;

  if (rowsToInsert.length === 0) {
    return {
      analyzedCount: 0,
      feedbacksAnalyzed: [],
      globalInsights,
      contexts: insightsContexts,
    };
  }

  const feedbacksAnalyzed = await insertFeedbackAnalysisRows({
    supabase,
    rows: rowsToInsert,
  });

  await upsertFeedbackInsightsReports({
    supabase,
    enterpriseId,
    contexts: insightsContexts,
  });

  return {
    analyzedCount: rowsToInsert.length,
    feedbacksAnalyzed,
    globalInsights,
    contexts: insightsContexts,
  };
}
