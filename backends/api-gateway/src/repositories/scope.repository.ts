import type { SupabaseClient } from '@supabase/supabase-js';
import type { IaAnalyzeScopeType } from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

type IdRow = { id: string };

/**
 * Resultado da resolução de escopo → ids de `collection_point`:
 *  - `{ ids: null }`     => sem filtro de escopo (todos os feedbacks da empresa)
 *  - `{ ids: string[] }` => filtrar `feedback` por esses ids (`[]` => nenhum resultado)
 *  - `{ error: true }`   => falha de query (o chamador escolhe o código de erro)
 */
export type ScopeCollectionPointResolution =
  | { error: true }
  | { error: false; ids: string[] | null };

/**
 * Resolve o escopo selecionado (header) para a lista de `collection_point` ids
 * que as métricas/análises devem considerar.
 *
 * COMPANY (Geral) => apenas o ponto de coleta da empresa (`catalog_item_id IS NULL`).
 * Compartilhado por stats, analysis e pela regeneração de insights para manter o
 * mesmo critério de escopo (a janela de linhas passa a valer DENTRO do escopo).
 */
export async function resolveScopeCollectionPointIds(params: {
  supabase: SupabaseClient;
  enterpriseId: string;
  scopeType: IaAnalyzeScopeType | undefined;
  catalogItemId: string | null;
}): Promise<ScopeCollectionPointResolution> {
  const { supabase, enterpriseId, scopeType, catalogItemId } = params;

  if (!scopeType && !catalogItemId) {
    return { error: false, ids: null };
  }

  if (scopeType === 'COMPANY') {
    if (catalogItemId) {
      return { error: false, ids: [] };
    }

    const { data: companyPoints, error: companyCpError } = await supabase
      .from('collection_points')
      .select('id')
      .eq('enterprise_id', enterpriseId)
      .is('catalog_item_id', null);

    if (companyCpError) return { error: true };
    return { error: false, ids: ((companyPoints ?? []) as IdRow[]).map((cp) => cp.id) };
  }

  if (catalogItemId) {
    if (scopeType) {
      const { data: catalogItem, error: catalogItemError } = await supabase
        .from('catalog_items')
        .select('id')
        .eq('enterprise_id', enterpriseId)
        .eq('id', catalogItemId)
        .eq('kind', scopeType)
        .maybeSingle();

      if (catalogItemError) return { error: true };
      if (!catalogItem) return { error: false, ids: [] };
    }

    const { data: points, error: pointsError } = await supabase
      .from('collection_points')
      .select('id')
      .eq('enterprise_id', enterpriseId)
      .eq('catalog_item_id', catalogItemId);

    if (pointsError) return { error: true };
    return { error: false, ids: ((points ?? []) as IdRow[]).map((cp) => cp.id) };
  }

  // scopeType sem catalogItemId (ex.: todos os itens de um kind).
  const { data: catalogItems, error: catalogItemsError } = await supabase
    .from('catalog_items')
    .select('id')
    .eq('enterprise_id', enterpriseId)
    .eq('kind', scopeType);

  if (catalogItemsError) return { error: true };

  const catalogIds = ((catalogItems ?? []) as IdRow[]).map((item) => item.id);

  if (catalogIds.length === 0) {
    return { error: false, ids: [] };
  }

  const { data: points, error: pointsError } = await supabase
    .from('collection_points')
    .select('id')
    .eq('enterprise_id', enterpriseId)
    .in('catalog_item_id', catalogIds);

  if (pointsError) return { error: true };
  return { error: false, ids: ((points ?? []) as IdRow[]).map((cp) => cp.id) };
}
