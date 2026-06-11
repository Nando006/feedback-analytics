import type { SupabaseClient } from '@supabase/supabase-js';

export type PublicQuestionScope = 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

/**
 * Busca as perguntas ATIVAS configuradas para um escopo do feedback público.
 *
 * - COMPANY (Geral): perguntas com `catalog_item_id IS NULL`.
 * - PRODUCT/SERVICE/DEPARTMENT: perguntas do `catalog_item_id` informado
 *   (ou `catalog_item_id IS NULL` como degradação quando não há item de contexto).
 *
 * A contagem é VARIÁVEL (0 a 3): retorna exatamente o que o gestor configurou
 * para aquele escopo. NUNCA faz fallback para outro escopo — quem chama decide
 * o que fazer com 0 perguntas (mostrar apenas nota + mensagem).
 *
 * Retorna o mesmo formato `{ data, error }` da query Supabase para manter o
 * uso idêntico nos controllers públicos (exibição e submit).
 */
export async function fetchActiveQuestionsForScope(params: {
  supabase: SupabaseClient;
  enterpriseId: string;
  scopeType: PublicQuestionScope;
  catalogItemId: string | null;
}) {
  const { supabase, enterpriseId, scopeType, catalogItemId } = params;

  let query = supabase
    .from('questions_of_feedbacks')
    .select(
      'id, scope_type, catalog_item_id, question_order, question_text, subquestions:feedback_question_subquestions(id, question_id, subquestion_order, subquestion_text, is_active)',
    )
    .eq('enterprise_id', enterpriseId)
    .eq('scope_type', scopeType)
    .eq('is_active', true)
    .order('question_order', { ascending: true });

  if (scopeType === 'COMPANY') {
    query = query.is('catalog_item_id', null);
  } else {
    query = catalogItemId
      ? query.eq('catalog_item_id', catalogItemId)
      : query.is('catalog_item_id', null);
  }

  return await query;
}
