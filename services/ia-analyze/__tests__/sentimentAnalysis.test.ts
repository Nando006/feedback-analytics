import { describe, it, expect } from 'vitest';
import { isValidSentiment, canProcessAnalyzedItem } from '../src/services/sentimentAnalysis.service.js';
import type { IaAnalyzeFeedbackInput } from '../../../shared/interfaces/contracts/ia-analyze/input.contract.js';

const baseFeedback: IaAnalyzeFeedbackInput = {
  id: 'feedback-001',
  message: 'Bom servico no geral.',
  rating: 4,
  created_at: '2026-04-19T10:00:00Z',
  scope_type: 'COMPANY',
  collection_point: null,
  catalog_item: null,
  dynamic_answers: [],
  dynamic_subanswers: [],
};

describe('isValidSentiment', () => {
  it.each(['positive', 'negative', 'neutral'])(
    'deve retornar true para sentimento valido: %s',
    (sentiment) => {
      expect(isValidSentiment(sentiment)).toBe(true);
    },
  );

  it.each(['POSITIVE', 'bad', 'bom', '', 0, null, undefined])(
    'deve retornar false para valor invalido: %s',
    (value) => {
      expect(isValidSentiment(value)).toBe(false);
    },
  );
});

describe('canProcessAnalyzedItem', () => {
  it('deve retornar true quando item valido e feedback existe no mapa', () => {
    const feedbackById = new Map([[baseFeedback.id, baseFeedback]]);

    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: 'feedback-001', sentiment: 'positive', categories: [], keywords: [] },
        feedbackById,
      }),
    ).toBe(true);
  });

  it('deve retornar false quando feedback_id nao existe no mapa', () => {
    const feedbackById = new Map([[baseFeedback.id, baseFeedback]]);

    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: 'feedback-inexistente', sentiment: 'positive', categories: [], keywords: [] },
        feedbackById,
      }),
    ).toBe(false);
  });

  it('deve retornar false quando sentimento e invalido', () => {
    const feedbackById = new Map([[baseFeedback.id, baseFeedback]]);

    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: 'feedback-001', sentiment: 'pessimo' as unknown as 'negative', categories: [], keywords: [] },
        feedbackById,
      }),
    ).toBe(false);
  });

  it('deve retornar false quando feedback_id nao e string', () => {
    const feedbackById = new Map([[baseFeedback.id, baseFeedback]]);

    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: 123 as unknown as string, sentiment: 'positive', categories: [], keywords: [] },
        feedbackById,
      }),
    ).toBe(false);
  });

  it('deve retornar false quando mapa de feedbacks esta vazio', () => {
    const feedbackById = new Map<string, IaAnalyzeFeedbackInput>();

    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: 'feedback-001', sentiment: 'neutral', categories: [], keywords: [] },
        feedbackById,
      }),
    ).toBe(false);
  });
});
