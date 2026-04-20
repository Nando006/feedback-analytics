import { runIaAnalyzeAnalysis } from '../../clients/iaAnalyze/runIaAnalyzeAnalysis.js';
import { IaAnalyzeServiceError } from '../../errors/iaAnalyze.errors.js';
import {
  fetchAlreadyAnalyzedFeedbackIds,
  fetchEnterpriseContextForAnalysis,
  fetchFeedbacksForAnalysis,
  insertFeedbackAnalysisRows,
  upsertFeedbackInsightsReports,
} from '../../repositories/iaAnalyze.repository.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IaAnalyzeRemoteRunRequest } from '../../../../shared/interfaces/contracts/ia-analyze/remote.contract.js';
import type {
  IaAnalyzeRunRequest,
  IaAnalyzeRunResponse,
} from '../../../../shared/interfaces/contracts/ia-analyze/run.contract.js';
import type {
  IaAnalyzeSentiment,
} from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import { buildEnterpriseContext } from '../iaAnalyze/buildEnterpriseContext.js';
import { hasRequiredEnterpriseInfoForAnalysis } from '../iaAnalyze/hasRequiredEnterpriseInfoForAnalysis.js';
import { applyExecutionFilter } from '../iaAnalyze/applyExecutionFilter.js';
import { buildAnalysisBatches } from '../iaAnalyze/buildAnalysisBatches.js';

/**
 * Quantidade mínima de feedbacks para considerar a análise relevante.
 *
 * Evita rodar análise IA com poucos dados, garantindo resultados mais confiáveis.
 */
const MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS = 10;

/**
 * Função principal para analisar feedbacks de uma empresa usando IA.
 *
 * Passos principais:
 * 1. Busca o contexto da empresa e valida se há dados suficientes para análise.
 * 2. Busca os feedbacks ainda não analisados, aplicando filtros e limites.
 * 3. Separa os feedbacks em lotes e monta o contexto para a IA.
 * 4. Envia os lotes para o serviço remoto de IA e processa o resultado.
 * 5. Valida e insere os resultados da análise no banco.
 * 6. Atualiza os relatórios de insights globais.
 *
 * Retorna um resumo da análise, incluindo quantos feedbacks foram analisados,
 * os resultados individuais, insights globais e os contextos processados.
 *
 * Garante que só roda a análise se houver feedbacks suficientes e evita duplicidade.
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