import { describe, it, expect } from 'vitest';
import {
  isGroundedInMessage,
  sanitizeTermList,
  buildForbiddenTerms,
  STRUCTURED_ANSWER_LABELS,
} from '../../lib/termProcessing.js';
import { normalizeForComparison } from '../../utils/normalizeForComparison.js';
import type { IaAnalyzeFeedbackInput } from '../../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';

describe('[Unidade] normalizeForComparison', () => {
  it('converte para minúsculas e remove acentos', () => {
    expect(normalizeForComparison('Ótimo')).toBe('otimo');
    expect(normalizeForComparison('Atendimento Rápido')).toBe('atendimento rapido');
    expect(normalizeForComparison('PÉSSIMO')).toBe('pessimo');
  });

  it('remove pontuação e colapsa espaços extras para um único espaço', () => {
    // vírgula e ! viram espaço, múltiplos espaços colapsam para um
    expect(normalizeForComparison('bom,  excelente!')).toBe('bom excelente');
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(normalizeForComparison('')).toBe('');
  });
});

describe('[Unidade] isGroundedInMessage', () => {
  it('retorna true quando termo está contido na mensagem normalizada', () => {
    const message = normalizeForComparison('Ótimo atendimento e qualidade');
    expect(isGroundedInMessage('atendimento', message)).toBe(true);
    expect(isGroundedInMessage('qualidade', message)).toBe(true);
  });

  it('retorna true quando palavra relevante do termo aparece na mensagem', () => {
    const message = normalizeForComparison('O produto chegou rapidamente');
    expect(isGroundedInMessage('entrega rapida', message)).toBe(false);
    expect(isGroundedInMessage('produto chegou', message)).toBe(true);
  });

  it('retorna false quando termo não tem relação com a mensagem', () => {
    const message = normalizeForComparison('Bom atendimento');
    expect(isGroundedInMessage('preco alto', message)).toBe(false);
  });

  it('retorna false para termo ou mensagem vazia', () => {
    expect(isGroundedInMessage('', 'alguma mensagem')).toBe(false);
    expect(isGroundedInMessage('termo', '')).toBe(false);
  });
});

describe('[Unidade] sanitizeTermList', () => {
  const MSG = normalizeForComparison('Atendimento rápido e produto de qualidade excelente');
  const FORBIDDEN = new Set<string>(STRUCTURED_ANSWER_LABELS);

  it('retorna lista limpa e normalizada', () => {
    const result = sanitizeTermList({
      terms: ['Atendimento', 'Qualidade'],
      messageNormalized: MSG,
      forbiddenTerms: FORBIDDEN,
      maxCount: 6,
    });
    expect(result).toContain('atendimento');
    expect(result).toContain('qualidade');
  });

  it('descarta termos proibidos (PESSIMO, RUIM, etc)', () => {
    const result = sanitizeTermList({
      terms: ['PESSIMO', 'ótima', 'qualidade'],
      messageNormalized: MSG,
      forbiddenTerms: FORBIDDEN,
      maxCount: 6,
    });
    expect(result).not.toContain('pessimo');
    expect(result).not.toContain('otima');
    expect(result).toContain('qualidade');
  });

  it('respeita maxCount', () => {
    const result = sanitizeTermList({
      terms: ['atendimento', 'qualidade', 'produto', 'excelente'],
      messageNormalized: MSG,
      forbiddenTerms: FORBIDDEN,
      maxCount: 2,
    });
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('remove duplicatas', () => {
    const result = sanitizeTermList({
      terms: ['atendimento', 'Atendimento', 'ATENDIMENTO'],
      messageNormalized: MSG,
      forbiddenTerms: FORBIDDEN,
      maxCount: 6,
    });
    expect(result.filter((t) => t === 'atendimento')).toHaveLength(1);
  });

  it('descarta termos sem relação com a mensagem', () => {
    const result = sanitizeTermList({
      terms: ['preco', 'desconto'],
      messageNormalized: MSG,
      forbiddenTerms: FORBIDDEN,
      maxCount: 6,
    });
    expect(result).toHaveLength(0);
  });
});

describe('[Unidade] buildForbiddenTerms', () => {
  it('inclui todos os STRUCTURED_ANSWER_LABELS no Set resultante', () => {
    const feedback: IaAnalyzeFeedbackInput = {
      id: 'fb-1',
      message: 'Test',
      rating: 5,
      created_at: new Date().toISOString(),
      scope_type: 'COMPANY',
      collection_point: 'qr',
      catalog_item: null,
      dynamic_answers: [],
      dynamic_subanswers: [],
    };

    const forbidden = buildForbiddenTerms(feedback);

    for (const label of STRUCTURED_ANSWER_LABELS) {
      expect(forbidden.has(label)).toBe(true);
    }
  });

  it('inclui valores das respostas dinâmicas como proibidos', () => {
    const feedback: IaAnalyzeFeedbackInput = {
      id: 'fb-1',
      message: 'Bom atendimento',
      rating: 4,
      created_at: new Date().toISOString(),
      scope_type: 'COMPANY',
      collection_point: 'qr',
      catalog_item: null,
      dynamic_answers: [
        {
          question_id: 'q1',
          question_text_snapshot: 'Como foi o atendimento?',
          answer_value: 'BOA',
          answer_score: 4,
        },
      ],
      dynamic_subanswers: [],
    };

    const forbidden = buildForbiddenTerms(feedback);

    expect(forbidden.has('boa')).toBe(true);
    expect(forbidden.has('como foi o atendimento')).toBe(true);
  });
});
