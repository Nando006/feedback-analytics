import { describe, it, expect } from 'vitest';
import {
  canonicalizeCategories,
  getTaxonomyLabels,
} from '../../lib/categoryTaxonomy.js';

describe('[Unidade] canonicalizeCategories', () => {
  it('mapeia sinônimo para o canônico (COMPANY)', () => {
    expect(canonicalizeCategories('COMPANY', ['suporte'])).toEqual(['atendimento']);
    expect(canonicalizeCategories('COMPANY', ['preço'])).toEqual(['preco']);
  });

  it('deduplica quando vários termos caem no mesmo canônico', () => {
    expect(
      canonicalizeCategories('COMPANY', ['suporte', 'atendimento', 'equipe']),
    ).toEqual(['atendimento']);
  });

  it('casa por token quando não há match exato', () => {
    expect(canonicalizeCategories('COMPANY', ['preco alto'])).toEqual(['preco']);
  });

  it('mantém termo sem match como emergente (normalizado)', () => {
    expect(canonicalizeCategories('COMPANY', ['Estacionamento'])).toEqual(['estacionamento']);
  });

  it('respeita a taxonomia por escopo', () => {
    expect(canonicalizeCategories('PRODUCT', ['acabamento'])).toEqual(['qualidade']);
    expect(canonicalizeCategories('SERVICE', ['demora'])).toEqual(['tempo de resposta']);
  });

  it('ignora vazios', () => {
    expect(canonicalizeCategories('COMPANY', ['', '   '])).toEqual([]);
  });
});

describe('[Unidade] getTaxonomyLabels', () => {
  it('retorna os rótulos canônicos do escopo', () => {
    const labels = getTaxonomyLabels('COMPANY');
    expect(labels).toContain('atendimento');
    expect(labels).toContain('preco');
    expect(labels.length).toBeGreaterThan(0);
  });
});
