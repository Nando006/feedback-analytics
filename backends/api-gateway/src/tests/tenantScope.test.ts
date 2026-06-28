import { describe, it, expect } from 'vitest';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import { scopedFeedbackWhere, assertEnterpriseId } from '../db/tenantScope.js';

// Compila a condição WHERE para SQL + params SEM tocar no banco — prova que o
// helper sempre injeta o enterprise_id e nunca vaza dados entre empresas.
const dialect = new PgDialect();
function compile(condition: SQL): { sql: string; params: unknown[] } {
  const { sql, params } = dialect.sqlToQuery(condition);
  return { sql, params };
}

describe('[Unit] tenantScope — isolamento multi-tenant', () => {
  it('a query SEMPRE filtra por enterprise_id', () => {
    const { sql, params } = compile(scopedFeedbackWhere('ent-A', null));
    expect(sql).toMatch(/enterprise_id"?\s*=\s*\$1/);
    expect(params).toEqual(['ent-A']);
  });

  it('empresas diferentes geram parâmetros diferentes (A nunca enxerga B)', () => {
    expect(compile(scopedFeedbackWhere('ent-A', null)).params).toEqual(['ent-A']);
    expect(compile(scopedFeedbackWhere('ent-B', null)).params).toEqual(['ent-B']);
  });

  it('o recorte por escopo (collection_point_id) NÃO remove o filtro de empresa', () => {
    const { sql, params } = compile(scopedFeedbackWhere('ent-A', ['cp-1', 'cp-2']));
    expect(sql).toMatch(/enterprise_id/);
    expect(sql).toMatch(/collection_point_id/);
    // enterprise_id primeiro, depois os ids do escopo — empresa sempre presente.
    expect(params).toEqual(['ent-A', 'cp-1', 'cp-2']);
  });

  it('recusa enterprise_id vazio — não permite query sem tenant', () => {
    expect(() => scopedFeedbackWhere('', null)).toThrow();
    expect(() => assertEnterpriseId('')).toThrow();
  });
});
