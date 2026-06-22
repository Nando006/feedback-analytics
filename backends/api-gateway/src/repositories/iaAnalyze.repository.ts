import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  IaAnalyzeAnalyzedItem,
  IaAnalyzeContext,
} from '../../../../shared/interfaces/contracts/ia-analyze/analysis.contract.js';
import type {
  IaAnalyzeFeedbackInput,
} from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type {
  IaAnalyzeScopeType,
  IaAnalyzeSentiment,
} from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';
import { IaAnalyzeServiceError } from '../libs/iaAnalyze/errors.js';
import { normalizeScopeType } from '../libs/iaAnalyze/normalize.js';
import type { SavedInsightsReport } from '../libs/iaAnalyze/insightsCache.js';
import { resolveScopeCollectionPointIds } from './scope.repository.js';
import type { CollectingDataContext, FeedbackAnalysisInsertRow, RawCatalogItemRow, RawFeedbackQuestionAnswerRow, RawFeedbackRow, RawFeedbackSubquestionAnswerRow } from '../types/iaAnalyze.types.js';

/**
 * Extrai o ponto de coleta principal de um feedback.
 *
 * - Se vier array, retorna o primeiro elemento (caso de múltiplos pontos).
 * - Se vier objeto único, retorna ele mesmo.
 * - Se não houver, retorna null.
 *
 * Útil para padronizar o acesso ao ponto de coleta, independente do formato retornado pelo banco.
 */
function resolveCollectionPoint(
  collectionPointRaw: RawFeedbackRow['collection_points'],
) {
  if (Array.isArray(collectionPointRaw)) {
    return collectionPointRaw[0] ?? null;
  }

  return collectionPointRaw ?? null;
}

/**
 * Busca e monta a lista de feedbacks prontos para análise IA.
 *
 * Etapas principais:
 * 1. Busca feedbacks do Supabase, incluindo ponto de coleta e catalog item.
 * 2. Busca respostas dinâmicas (perguntas e subperguntas) associadas.
 * 3. Monta o objeto IaAnalyzeFeedbackInput para cada feedback, já normalizado.
 *
 * Lança erros claros em caso de falha nas queries.
 *
 * Útil para centralizar toda a lógica de preparação dos dados de entrada da IA.
 */
export async function fetchFeedbacksForAnalysis(params: {
  supabase: SupabaseClient;
  enterpriseId: string;
  limit: number;
  scopeType?: IaAnalyzeScopeType;
  catalogItemId?: string | null;
}): Promise<IaAnalyzeFeedbackInput[]> {
  const { supabase, enterpriseId, limit, scopeType, catalogItemId = null } = params;

  // Resolve o escopo pedido para ids de collection_point, para que a janela de
  // `limit` linhas valha DENTRO do escopo (e não nas mais recentes da empresa
  // inteira). Mesmo critério de escopo de stats/analysis/regeneração.
  const scopeResolution = await resolveScopeCollectionPointIds({
    supabase,
    enterpriseId,
    scopeType,
    catalogItemId,
  });

  if (scopeResolution.error) {
    throw new IaAnalyzeServiceError(
      'Failed to resolve scope for feedbacks',
      500,
      'failed_to_fetch_feedbacks_for_ia',
    );
  }

  const scopedCollectionPointIds = scopeResolution.ids;

  // Escopo válido porém sem nenhum ponto de coleta => não há o que analisar.
  if (scopedCollectionPointIds && scopedCollectionPointIds.length === 0) {
    return [];
  }

  let feedbackQuery = supabase
    .from('feedback')
    .select(
      `
      id,
      message,
      rating,
      created_at,
      collection_points(
        id,
        name,
        type,
        identifier,
        catalog_item_id
      )
    `,
    )
    .eq('enterprise_id', enterpriseId);

  if (scopedCollectionPointIds) {
    feedbackQuery = feedbackQuery.in('collection_point_id', scopedCollectionPointIds);
  }

  const { data: feedbacks, error: feedbackError } = await feedbackQuery
    .order('created_at', { ascending: false })
    .limit(limit);

  if (feedbackError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch feedbacks for IA',
      500,
      'failed_to_fetch_feedbacks_for_ia',
    );
  }

  const feedbackRows = (feedbacks ?? []) as RawFeedbackRow[];

  const catalogItemIds = Array.from(
    new Set(
      feedbackRows
        .map((feedback) => resolveCollectionPoint(feedback.collection_points)?.catalog_item_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

  let catalogItemById = new Map<
    string,
    {
      id: string;
      name: string;
      kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
      description: string | null;
    }
  >();

  if (catalogItemIds.length > 0) {
    const { data: catalogRows, error: catalogError } = await supabase
      .from('catalog_items')
      .select('id, name, kind, description')
      .in('id', catalogItemIds);

    if (catalogError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch catalog items for IA',
        500,
        'failed_to_fetch_catalog_items_for_ia',
      );
    }

    catalogItemById = new Map(
      ((catalogRows ?? []) as RawCatalogItemRow[])
        .map((row) => {
          const scopeType = normalizeScopeType(row.kind);
          if (scopeType === 'COMPANY') return null;

          return [
            row.id,
            {
              id: row.id,
              name: row.name,
              kind: scopeType,
              description: row.description ?? null,
            },
          ] as const;
        })
        .filter(
          (
            entry,
          ): entry is readonly [
            string,
            {
              id: string;
              name: string;
              kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';
              description: string | null;
            },
          ] => Boolean(entry),
        ),
    );
  }

  const feedbackIds = feedbackRows
    .map((feedback) => feedback.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const answersByFeedbackId = new Map<
    string,
    Array<{
      question_id: string;
      question_text_snapshot: string;
      answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
      answer_score: number;
    }>
  >();

  const subanswersByFeedbackId = new Map<
    string,
    Array<{
      subquestion_id: string;
      subquestion_text_snapshot: string;
      answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
      answer_score: number;
    }>
  >();

  if (feedbackIds.length > 0) {
    const { data: answerRows, error: answersError } = await supabase
      .from('feedback_question_answers')
      .select(
        'feedback_id, question_id, question_text_snapshot, answer_value, answer_score, created_at',
      )
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (answersError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch feedback dynamic answers for IA',
        500,
        'failed_to_fetch_feedback_dynamic_answers_for_ia',
      );
    }

    ((answerRows ?? []) as RawFeedbackQuestionAnswerRow[]).forEach((answer) => {
      const current = answersByFeedbackId.get(answer.feedback_id) ?? [];

      current.push({
        question_id: answer.question_id,
        question_text_snapshot: answer.question_text_snapshot,
        answer_value: answer.answer_value,
        answer_score: answer.answer_score,
      });

      answersByFeedbackId.set(answer.feedback_id, current);
    });

    const { data: subanswerRows, error: subanswersError } = await supabase
      .from('feedback_subquestion_answers')
      .select(
        'feedback_id, subquestion_id, subquestion_text_snapshot, answer_value, answer_score, created_at',
      )
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (subanswersError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch feedback dynamic subanswers for IA',
        500,
        'failed_to_fetch_feedback_dynamic_subanswers_for_ia',
      );
    }

    ((subanswerRows ?? []) as RawFeedbackSubquestionAnswerRow[]).forEach(
      (subanswer) => {
        const current = subanswersByFeedbackId.get(subanswer.feedback_id) ?? [];

        current.push({
          subquestion_id: subanswer.subquestion_id,
          subquestion_text_snapshot: subanswer.subquestion_text_snapshot,
          answer_value: subanswer.answer_value,
          answer_score: subanswer.answer_score,
        });

        subanswersByFeedbackId.set(subanswer.feedback_id, current);
      },
    );
  }

  return feedbackRows.map((feedback) => {
    const collectionPoint = resolveCollectionPoint(feedback.collection_points);

    const catalogItemId =
      typeof collectionPoint?.catalog_item_id === 'string'
        ? collectionPoint.catalog_item_id
        : null;

    const catalogItem = catalogItemId
      ? (catalogItemById.get(catalogItemId) ?? null)
      : null;

    const scopeType = normalizeScopeType(catalogItem?.kind ?? null);

    return {
      id: feedback.id,
      message: feedback.message,
      rating: feedback.rating ?? null,
      created_at: feedback.created_at ?? null,
      scope_type: scopeType,
      collection_point: {
        id: collectionPoint?.id ?? null,
        name: collectionPoint?.name ?? null,
        type: collectionPoint?.type ?? null,
        identifier: collectionPoint?.identifier ?? null,
      },
      catalog_item: catalogItem,
      dynamic_answers: answersByFeedbackId.get(feedback.id) ?? [],
      dynamic_subanswers: subanswersByFeedbackId.get(feedback.id) ?? [],
    } satisfies IaAnalyzeFeedbackInput;
  });
}

/**
 * Busca o contexto da empresa para análise IA, incluindo dados de coleta e nome.
 *
 * Etapas principais:
 * 1. Busca o id da empresa pelo usuário autenticado.
 * 2. Busca dados de coleta (collecting_data_enterprise) para enriquecer o contexto.
 * 3. Busca o nome da empresa a partir do user_metadata.
 *
 * Lança erros claros se não encontrar empresa ou dados obrigatórios.
 *
 * Útil para garantir que a análise IA sempre tenha contexto empresarial completo.
 */
export async function fetchEnterpriseContextForAnalysis(params: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<{
  enterpriseId: string;
  collecting: CollectingDataContext | null;
  enterpriseName: string | null;
}> {
  const { supabase, userId } = params;

  const { data: enterpriseRow, error: enterpriseError } = await supabase
    .from('enterprise')
    .select('id')
    .eq('auth_user_id', userId)
    .single();

  if (enterpriseError || !enterpriseRow) {
    throw new IaAnalyzeServiceError('Enterprise not found', 404, 'enterprise_not_found');
  }

  const enterpriseId = enterpriseRow.id as string;

  const { data: collecting, error: collectingError } = await supabase
    .from('collecting_data_enterprise')
    .select(
      'company_objective, analytics_goal, business_summary, main_products_or_services',
    )
    .eq('enterprise_id', enterpriseId)
    .maybeSingle();

  if (collectingError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch collecting data',
      500,
      'failed_to_fetch_collecting_data',
    );
  }

  const { data: authData } = await supabase.auth.getUser();
  const enterpriseName =
    (authData.user?.user_metadata as { full_name?: string } | null)?.full_name ?? null;

  return {
    enterpriseId,
    collecting: (collecting as CollectingDataContext | null) ?? null,
    enterpriseName,
  };
}

/**
 * Busca os IDs de feedbacks que já possuem análise IA salva.
 *
 * Etapas principais:
 * 1. Se lista de IDs for vazia, retorna Set vazio.
 * 2. Consulta feedback_analysis para IDs já analisados.
 * 3. Retorna Set com os IDs encontrados.
 *
 * Lança erro se a query falhar.
 *
 * Útil para evitar reprocessar feedbacks já analisados e garantir idempotência.
 */
export async function fetchAlreadyAnalyzedFeedbackIds(params: {
  supabase: SupabaseClient;
  feedbackIds: string[];
}): Promise<Set<string>> {
  const { supabase, feedbackIds } = params;

  if (feedbackIds.length === 0) {
    return new Set<string>();
  }

  const { data: existingAnalysis, error: existingAnalysisError } = await supabase
    .from('feedback_analysis')
    .select('feedback_id')
    .in('feedback_id', feedbackIds);

  if (existingAnalysisError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch existing analysis',
      500,
      'failed_to_fetch_existing_analysis',
    );
  }

  return new Set(
    (existingAnalysis ?? [])
      .map((row: { feedback_id: string | null }) => row.feedback_id)
      .filter((feedbackId: string | null): feedbackId is string =>
        typeof feedbackId === 'string' && feedbackId.length > 0,
      ),
  );
}

/**
 * Insere múltiplas análises IA de feedbacks na tabela feedback_analysis.
 *
 * Etapas principais:
 * 1. Se não houver linhas, retorna array vazio.
 * 2. Insere as linhas na tabela e retorna os dados principais inseridos.
 * 3. Lança erro se a inserção falhar.
 *
 * Útil para salvar em lote os resultados da análise IA, garantindo retorno dos dados essenciais.
 */
export async function insertFeedbackAnalysisRows(params: {
  supabase: SupabaseClient;
  rows: FeedbackAnalysisInsertRow[];
}): Promise<IaAnalyzeAnalyzedItem[]> {
  const { supabase, rows } = params;

  if (rows.length === 0) {
    return [];
  }

  const { data: inserted, error: insertError } = await supabase
    .from('feedback_analysis')
    .insert(rows)
    .select('id, feedback_id, sentiment, categories, keywords');

  if (insertError) {
    throw new IaAnalyzeServiceError(
      'Failed to save feedback analysis',
      500,
      'failed_to_save_feedback_analysis',
    );
  }

  return (
    inserted?.map((row: {
      id: string;
      feedback_id: string;
      sentiment: IaAnalyzeSentiment;
      categories: string[] | null;
      keywords: string[] | null;
    }) => ({
      id: row.id,
      feedback_id: row.feedback_id,
      sentiment: row.sentiment,
      categories: row.categories ?? [],
      keywords: row.keywords ?? [],
    })) ?? []
  );
}

/**
 * Faz upsert (atualiza ou insere) relatórios de insights IA na tabela feedback_insights_report.
 *
 * Etapas principais:
 * 1. Para cada contexto, verifica se há dados relevantes (resumo ou recomendações).
 * 2. Faz upsert por escopo via unicidade composta (enterprise_id, scope_type, catalog_item_id).
 * 3. Loga erro no console se falhar, mas não interrompe o loop.
 *
 * Retorna os contextos efetivamente persistidos (usado para detectar o "falso
 * sucesso" quando nada relevante foi gerado para o escopo pedido).
 */
export async function upsertFeedbackInsightsReports(params: {
  supabase: SupabaseClient;
  enterpriseId: string;
  contexts: IaAnalyzeContext[];
}): Promise<IaAnalyzeContext[]> {
  const { supabase, enterpriseId, contexts } = params;

  // Contextos que realmente viraram linha salva — usado para detectar o
  // "falso sucesso" (quando nada relevante foi gerado para o escopo).
  const persisted: IaAnalyzeContext[] = [];

  for (const context of contexts) {
    const summary = context.globalInsights?.summary?.trim() || null;
    const recommendations =
      context.globalInsights?.recommendations?.filter((value: string) =>
        String(value ?? '').trim(),
      ) ?? [];

    const hasMeaningfulData = summary || recommendations.length > 0;

    if (!hasMeaningfulData) {
      continue;
    }

    const payload = {
      enterprise_id: enterpriseId,
      scope_type: context.scope_type,
      catalog_item_id: context.catalog_item_id,
      catalog_item_name: context.catalog_item_name,
      summary,
      recommendations,
      updated_at: new Date().toISOString(),
    };

    const { error: scopedUpsertError } = await supabase
      .from('feedback_insights_report')
      .upsert(payload, {
        onConflict: 'enterprise_id,scope_type,catalog_item_id',
      });

    if (scopedUpsertError) {
      console.error('Falha ao salvar feedback_insights_report', scopedUpsertError);
      continue;
    }

    persisted.push(context);
  }

  return persisted;
}

/**
 * Busca feedbacks que já possuem análise IA salva, retornando todos os dados necessários para exibição ou reprocessamento.
 *
 * Etapas principais:
 * 1. Resolve o escopo pedido (scope_type/catalog_item_id) para ids de ponto de coleta.
 * 2. Busca feedbacks que possuem relação com feedback_analysis (join interno),
 *    já restritos ao escopo — a janela de `limit` vale DENTRO do escopo.
 * 3. Busca dados de ponto de coleta, item de catálogo, respostas e subrespostas dinâmicas.
 * 4. Monta o objeto IaAnalyzeFeedbackInput para cada feedback analisado.
 *
 * Lança erro se alguma query falhar.
 *
 * Útil para exibir apenas feedbacks já analisados ou para reprocessamento/relatórios.
 * Restringir a busca ao escopo evita que um escopo específico cujos feedbacks
 * analisados caem fora das 100 linhas mais recentes da empresa fique sem relatório.
 */
export async function fetchAlreadyAnalyzedFeedbacks(params: {
  supabase: SupabaseClient;
  enterpriseId: string;
  scopeType?: IaAnalyzeScopeType;
  catalogItemId?: string | null;
  limit?: number;
}): Promise<IaAnalyzeFeedbackInput[]> {
  const { supabase, enterpriseId, scopeType, catalogItemId = null, limit = 100 } = params;

  // Resolve o escopo pedido para ids de collection_point, para que a janela de
  // `limit` linhas valha DENTRO do escopo (e não nas linhas mais recentes da
  // empresa inteira). Mantém o mesmo critério de escopo de stats/analysis.
  const scopeResolution = await resolveScopeCollectionPointIds({
    supabase,
    enterpriseId,
    scopeType,
    catalogItemId,
  });

  if (scopeResolution.error) {
    throw new IaAnalyzeServiceError(
      'Failed to resolve scope for analyzed feedbacks',
      500,
      'failed_to_fetch_analyzed_feedbacks',
    );
  }

  const scopedCollectionPointIds = scopeResolution.ids;

  // Escopo válido porém sem nenhum ponto de coleta => não há o que buscar.
  if (scopedCollectionPointIds && scopedCollectionPointIds.length === 0) {
    return [];
  }

  let feedbackQuery = supabase
    .from('feedback')
    .select(
      `
      id,
      message,
      rating,
      created_at,
      collection_points(
        id,
        name,
        type,
        identifier,
        catalog_item_id
      ),
      feedback_analysis!inner(feedback_id)
    `,
    )
    .eq('enterprise_id', enterpriseId);

  if (scopedCollectionPointIds) {
    feedbackQuery = feedbackQuery.in('collection_point_id', scopedCollectionPointIds);
  }

  const { data: feedbacks, error: feedbackError } = await feedbackQuery
    .order('created_at', { ascending: false })
    .limit(limit);

  if (feedbackError) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch analyzed feedbacks',
      500,
      'failed_to_fetch_analyzed_feedbacks',
    );
  }

  const feedbackRows = (feedbacks ?? []) as RawFeedbackRow[];

  const catalogItemIds = Array.from(
    new Set(
      feedbackRows
        .map((f) => resolveCollectionPoint(f.collection_points)?.catalog_item_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

  let catalogItemById = new Map<
    string,
    { id: string; name: string; kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT'; description: string | null }
  >();

  if (catalogItemIds.length > 0) {
    const { data: catalogRows, error: catalogError } = await supabase
      .from('catalog_items')
      .select('id, name, kind, description')
      .in('id', catalogItemIds);

    if (catalogError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch catalog items for IA',
        500,
        'failed_to_fetch_catalog_items_for_ia',
      );
    }

    catalogItemById = new Map(
      ((catalogRows ?? []) as RawCatalogItemRow[])
        .map((row) => {
          const scopeType = normalizeScopeType(row.kind);
          if (scopeType === 'COMPANY') return null;
          return [
            row.id,
            { id: row.id, name: row.name, kind: scopeType, description: row.description ?? null },
          ] as const;
        })
        .filter(
          (entry): entry is readonly [string, { id: string; name: string; kind: 'PRODUCT' | 'SERVICE' | 'DEPARTMENT'; description: string | null }] =>
            Boolean(entry),
        ),
    );
  }

  const feedbackIds = feedbackRows
    .map((f) => f.id)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const answersByFeedbackId = new Map<
    string,
    Array<{ question_id: string; question_text_snapshot: string; answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA'; answer_score: number }>
  >();
  const subanswersByFeedbackId = new Map<
    string,
    Array<{ subquestion_id: string; subquestion_text_snapshot: string; answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA'; answer_score: number }>
  >();

  if (feedbackIds.length > 0) {
    const { data: answerRows, error: answersError } = await supabase
      .from('feedback_question_answers')
      .select('feedback_id, question_id, question_text_snapshot, answer_value, answer_score, created_at')
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (answersError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch answers',
        500,
        'failed_to_fetch_feedback_dynamic_answers_for_ia',
      );
    }

    ((answerRows ?? []) as RawFeedbackQuestionAnswerRow[]).forEach((answer) => {
      const current = answersByFeedbackId.get(answer.feedback_id) ?? [];
      current.push({
        question_id: answer.question_id,
        question_text_snapshot: answer.question_text_snapshot,
        answer_value: answer.answer_value,
        answer_score: answer.answer_score,
      });
      answersByFeedbackId.set(answer.feedback_id, current);
    });

    const { data: subanswerRows, error: subanswersError } = await supabase
      .from('feedback_subquestion_answers')
      .select('feedback_id, subquestion_id, subquestion_text_snapshot, answer_value, answer_score, created_at')
      .in('feedback_id', feedbackIds)
      .order('created_at', { ascending: true });

    if (subanswersError) {
      throw new IaAnalyzeServiceError(
        'Failed to fetch subanswers',
        500,
        'failed_to_fetch_feedback_dynamic_subanswers_for_ia',
      );
    }

    ((subanswerRows ?? []) as RawFeedbackSubquestionAnswerRow[]).forEach((subanswer) => {
      const current = subanswersByFeedbackId.get(subanswer.feedback_id) ?? [];
      current.push({
        subquestion_id: subanswer.subquestion_id,
        subquestion_text_snapshot: subanswer.subquestion_text_snapshot,
        answer_value: subanswer.answer_value,
        answer_score: subanswer.answer_score,
      });
      subanswersByFeedbackId.set(subanswer.feedback_id, current);
    });
  }

  return feedbackRows.map((feedback) => {
    const collectionPoint = resolveCollectionPoint(feedback.collection_points);
    const catalogItemId =
      typeof collectionPoint?.catalog_item_id === 'string' ? collectionPoint.catalog_item_id : null;
    const catalogItem = catalogItemId ? (catalogItemById.get(catalogItemId) ?? null) : null;
    const scopeType = normalizeScopeType(catalogItem?.kind ?? null);

    return {
      id: feedback.id,
      message: feedback.message,
      rating: feedback.rating ?? null,
      created_at: feedback.created_at ?? null,
      scope_type: scopeType,
      collection_point: {
        id: collectionPoint?.id ?? null,
        name: collectionPoint?.name ?? null,
        type: collectionPoint?.type ?? null,
        identifier: collectionPoint?.identifier ?? null,
      },
      catalog_item: catalogItem,
      dynamic_answers: answersByFeedbackId.get(feedback.id) ?? [],
      dynamic_subanswers: subanswersByFeedbackId.get(feedback.id) ?? [],
    } satisfies IaAnalyzeFeedbackInput;
  });
}

/**
 * Lê os relatórios de insights já salvos (`feedback_insights_report`) para o
 * escopo pedido. É a base do cache de leitura da regeneração: havendo relatório
 * e nenhum feedback analisado mais novo, devolvemos o salvo sem chamar o LLM.
 *
 * - Com `scopeType`: filtra por scope_type + catalog_item_id (uma linha por
 *   escopo, pela unique composta `uq_feedback_insights_context`).
 * - Sem `scopeType`: devolve todos os relatórios da empresa.
 */
export async function fetchFeedbackInsightsReports(params: {
  supabase: SupabaseClient;
  enterpriseId: string;
  scopeType?: IaAnalyzeScopeType;
  catalogItemId?: string | null;
}): Promise<SavedInsightsReport[]> {
  const { supabase, enterpriseId, scopeType, catalogItemId = null } = params;

  let query = supabase
    .from('feedback_insights_report')
    .select('scope_type, catalog_item_id, catalog_item_name, summary, recommendations, updated_at')
    .eq('enterprise_id', enterpriseId);

  if (scopeType) {
    query = query.eq('scope_type', scopeType);
    query = catalogItemId
      ? query.eq('catalog_item_id', catalogItemId)
      : query.is('catalog_item_id', null);
  }

  const { data, error } = await query;

  if (error) {
    throw new IaAnalyzeServiceError(
      'Failed to fetch feedback insights reports',
      500,
      'failed_to_fetch_insights_report',
    );
  }

  return (data ?? []) as SavedInsightsReport[];
}
