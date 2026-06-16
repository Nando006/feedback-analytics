import { vi, describe, it, expect } from 'vitest';
import {
  fetchAlreadyAnalyzedFeedbacks,
  fetchFeedbacksForAnalysis,
} from '../repositories/iaAnalyze.repository.js';

/**
 * Regressão do "insights falso sucesso": `fetchAlreadyAnalyzedFeedbacks` precisa
 * restringir a busca ao escopo pedido ANTES de aplicar o limite de linhas. Sem
 * isso, um escopo (ex.: um SERVICE) cujos feedbacks analisados caem fora das 100
 * linhas mais recentes da empresa inteira ficava sem relatório, mesmo havendo
 * dados — porque a janela recente-100 era buscada por empresa e só depois filtrada.
 *
 * Aqui não simulamos ORDER BY/LIMIT do Postgres; provamos o invariante que
 * corrige o bug: a query de `feedback` é filtrada por `collection_point_id` do
 * escopo resolvido, então o LIMIT passa a valer DENTRO do escopo.
 */

type RecordedCall = { method: string; args: unknown[] };
type FromCall = { table: string; calls: RecordedCall[] };

const CHAINABLES = [
  'select', 'eq', 'neq', 'in', 'is', 'gte', 'lte', 'limit', 'order', 'ilike', 'range',
] as const;

/**
 * Mock de Supabase que entrega um builder novo por `.from(table)`, grava a cadeia
 * de chamadas e resolve (`await`/`maybeSingle`/`single`) com o valor que o
 * `getResult(table, calls)` decidir.
 */
function makeScopedSupabase(
  getResult: (table: string, calls: RecordedCall[]) => { data: unknown; error: unknown },
) {
  const fromCalls: FromCall[] = [];

  function makeBuilder(table: string) {
    const calls: RecordedCall[] = [];
    fromCalls.push({ table, calls });

    const builder: Record<string, unknown> = {};

    for (const method of CHAINABLES) {
      builder[method] = vi.fn((...args: unknown[]) => {
        calls.push({ method, args });
        return builder;
      });
    }

    const terminal = (method: string) =>
      vi.fn(() => {
        calls.push({ method, args: [] });
        return Promise.resolve(getResult(table, calls));
      });

    builder.maybeSingle = terminal('maybeSingle');
    builder.single = terminal('single');
    // Suporte a `await query` direto (sem .single()/.maybeSingle()).
    builder.then = (resolve: (value: unknown) => void) => {
      const result = getResult(table, calls);
      resolve(result);
      return Promise.resolve(result);
    };

    return builder;
  }

  const client = {
    from: vi.fn((table: string) => makeBuilder(table)),
  };

  return { client, fromCalls };
}

function findFeedbackScopeFilter(fromCalls: FromCall[]) {
  const feedbackFrom = fromCalls.find((entry) => entry.table === 'feedback');
  return feedbackFrom?.calls.find(
    (call) => call.method === 'in' && call.args[0] === 'collection_point_id',
  );
}

describe('fetchAlreadyAnalyzedFeedbacks (escopo)', () => {
  const SCOPED_CP_IDS = [{ id: 'cp-1' }, { id: 'cp-2' }];
  const CATALOG_ROW = { id: 'svc-1', name: 'Atendimento', kind: 'SERVICE', description: null };
  const ANALYZED_FEEDBACK = {
    id: 'fb-101',
    message: 'Atendimento excelente no balcão',
    rating: 5,
    created_at: '2026-06-01T00:00:00.000Z',
    collection_points: {
      id: 'cp-1',
      name: 'Balcão',
      type: 'SERVICE',
      identifier: null,
      catalog_item_id: 'svc-1',
    },
  };

  it('restringe a busca de feedbacks aos pontos de coleta do escopo (limit vale DENTRO do escopo)', async () => {
    const { client, fromCalls } = makeScopedSupabase((table, calls) => {
      if (table === 'catalog_items') {
        // Enriquecimento (monta o catalog_item) usa `.in('id', ...)`; a resolução
        // de escopo usa `.eq('kind').maybeSingle()`.
        const isEnrichment = calls.some((c) => c.method === 'in' && c.args[0] === 'id');
        return isEnrichment
          ? { data: [CATALOG_ROW], error: null }
          : { data: { id: 'svc-1' }, error: null };
      }
      if (table === 'collection_points') return { data: SCOPED_CP_IDS, error: null };
      if (table === 'feedback') return { data: [ANALYZED_FEEDBACK], error: null };
      return { data: [], error: null };
    });

    const result = await fetchAlreadyAnalyzedFeedbacks({
      supabase: client as never,
      enterpriseId: 'ent-1',
      scopeType: 'SERVICE',
      catalogItemId: 'svc-1',
    });

    // A query de feedback foi filtrada pelos pontos de coleta do escopo.
    const scopeFilter = findFeedbackScopeFilter(fromCalls);
    expect(scopeFilter).toBeDefined();
    expect(scopeFilter?.args[1]).toEqual(['cp-1', 'cp-2']);

    // E o feedback analisado do escopo é retornado (relatório pode ser gerado).
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('fb-101');
    expect(result[0]?.scope_type).toBe('SERVICE');
    expect(result[0]?.catalog_item?.id).toBe('svc-1');
  });

  it('sem escopo, NÃO filtra por collection_point_id (comportamento por empresa preservado)', async () => {
    const { client, fromCalls } = makeScopedSupabase((table, calls) => {
      if (table === 'catalog_items') {
        const isEnrichment = calls.some((c) => c.method === 'in' && c.args[0] === 'id');
        return isEnrichment
          ? { data: [CATALOG_ROW], error: null }
          : { data: null, error: null };
      }
      if (table === 'feedback') return { data: [ANALYZED_FEEDBACK], error: null };
      return { data: [], error: null };
    });

    const result = await fetchAlreadyAnalyzedFeedbacks({
      supabase: client as never,
      enterpriseId: 'ent-1',
    });

    expect(findFeedbackScopeFilter(fromCalls)).toBeUndefined();
    // Sem escopo, não há resolução por pontos de coleta.
    expect(fromCalls.some((entry) => entry.table === 'collection_points')).toBe(false);
    expect(result).toHaveLength(1);
  });

  it('escopo sem pontos de coleta retorna vazio sem nem consultar feedback', async () => {
    const { client, fromCalls } = makeScopedSupabase((table) => {
      if (table === 'catalog_items') return { data: { id: 'svc-2' }, error: null };
      if (table === 'collection_points') return { data: [], error: null };
      return { data: [], error: null };
    });

    const result = await fetchAlreadyAnalyzedFeedbacks({
      supabase: client as never,
      enterpriseId: 'ent-1',
      scopeType: 'SERVICE',
      catalogItemId: 'svc-2',
    });

    expect(result).toEqual([]);
    expect(fromCalls.some((entry) => entry.table === 'feedback')).toBe(false);
  });
});

/**
 * Mesmo invariante para o caminho de "Analisar feedbacks" (feedbacks brutos): a
 * busca precisa ser restrita ao escopo ANTES do limite, senão um escopo cujos
 * feedbacks caem fora das N linhas mais recentes da empresa fica sem análise.
 */
describe('fetchFeedbacksForAnalysis (escopo)', () => {
  const SCOPED_CP_IDS = [{ id: 'cp-1' }, { id: 'cp-2' }];
  const CATALOG_ROW = { id: 'svc-1', name: 'Atendimento', kind: 'SERVICE', description: null };
  const RAW_FEEDBACK = {
    id: 'fb-201',
    message: 'Demorou no balcão',
    rating: 2,
    created_at: '2026-06-02T00:00:00.000Z',
    collection_points: {
      id: 'cp-1',
      name: 'Balcão',
      type: 'SERVICE',
      identifier: null,
      catalog_item_id: 'svc-1',
    },
  };

  it('restringe a busca de feedbacks brutos aos pontos de coleta do escopo', async () => {
    const { client, fromCalls } = makeScopedSupabase((table, calls) => {
      if (table === 'catalog_items') {
        const isEnrichment = calls.some((c) => c.method === 'in' && c.args[0] === 'id');
        return isEnrichment
          ? { data: [CATALOG_ROW], error: null }
          : { data: { id: 'svc-1' }, error: null };
      }
      if (table === 'collection_points') return { data: SCOPED_CP_IDS, error: null };
      if (table === 'feedback') return { data: [RAW_FEEDBACK], error: null };
      return { data: [], error: null };
    });

    const result = await fetchFeedbacksForAnalysis({
      supabase: client as never,
      enterpriseId: 'ent-1',
      limit: 50,
      scopeType: 'SERVICE',
      catalogItemId: 'svc-1',
    });

    const scopeFilter = findFeedbackScopeFilter(fromCalls);
    expect(scopeFilter).toBeDefined();
    expect(scopeFilter?.args[1]).toEqual(['cp-1', 'cp-2']);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('fb-201');
    expect(result[0]?.scope_type).toBe('SERVICE');
    expect(result[0]?.catalog_item?.id).toBe('svc-1');
  });

  it('sem escopo, NÃO filtra por collection_point_id (comportamento por empresa preservado)', async () => {
    const { client, fromCalls } = makeScopedSupabase((table, calls) => {
      if (table === 'catalog_items') {
        const isEnrichment = calls.some((c) => c.method === 'in' && c.args[0] === 'id');
        return isEnrichment
          ? { data: [CATALOG_ROW], error: null }
          : { data: null, error: null };
      }
      if (table === 'feedback') return { data: [RAW_FEEDBACK], error: null };
      return { data: [], error: null };
    });

    const result = await fetchFeedbacksForAnalysis({
      supabase: client as never,
      enterpriseId: 'ent-1',
      limit: 50,
    });

    expect(findFeedbackScopeFilter(fromCalls)).toBeUndefined();
    expect(fromCalls.some((entry) => entry.table === 'collection_points')).toBe(false);
    expect(result).toHaveLength(1);
  });

  it('escopo sem pontos de coleta retorna vazio sem nem consultar feedback', async () => {
    const { client, fromCalls } = makeScopedSupabase((table) => {
      if (table === 'catalog_items') return { data: { id: 'svc-2' }, error: null };
      if (table === 'collection_points') return { data: [], error: null };
      return { data: [], error: null };
    });

    const result = await fetchFeedbacksForAnalysis({
      supabase: client as never,
      enterpriseId: 'ent-1',
      limit: 50,
      scopeType: 'SERVICE',
      catalogItemId: 'svc-2',
    });

    expect(result).toEqual([]);
    expect(fromCalls.some((entry) => entry.table === 'feedback')).toBe(false);
  });
});
