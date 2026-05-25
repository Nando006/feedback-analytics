import { describe, it, expect } from 'vitest';
import {
  isValidSentiment,
  canProcessAnalyzedItem,
  VALID_SENTIMENTS,
} from '../../services/sentimentAnalysis.service.js';

describe('isValidSentiment', () => {
  it.each(VALID_SENTIMENTS)('aceita "%s" como sentimento válido', (sentiment) => {
    expect(isValidSentiment(sentiment)).toBe(true);
  });

  it('rejeita string desconhecida', () => {
    expect(isValidSentiment('happy')).toBe(false);
    expect(isValidSentiment('bad')).toBe(false);
    expect(isValidSentiment('')).toBe(false);
  });

  it('rejeita valores não-string', () => {
    expect(isValidSentiment(null)).toBe(false);
    expect(isValidSentiment(undefined)).toBe(false);
    expect(isValidSentiment(42)).toBe(false);
    expect(isValidSentiment({})).toBe(false);
  });
});

describe('canProcessAnalyzedItem', () => {
  const FEEDBACK_ID = 'fb-id-1';
  const feedbackById = new Map([[FEEDBACK_ID, {} as never]]);

  it('retorna true quando todos os campos são válidos', () => {
    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: FEEDBACK_ID, sentiment: 'positive' },
        feedbackById,
      }),
    ).toBe(true);
  });

  it('retorna false quando feedback_id não é string', () => {
    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: 123 as never, sentiment: 'positive' },
        feedbackById,
      }),
    ).toBe(false);
  });

  it('retorna false quando sentimento é inválido', () => {
    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: FEEDBACK_ID, sentiment: 'muito_positivo' as never },
        feedbackById,
      }),
    ).toBe(false);
  });

  it('retorna false quando feedback_id não existe no mapa', () => {
    expect(
      canProcessAnalyzedItem({
        item: { feedback_id: 'id-inexistente', sentiment: 'positive' },
        feedbackById,
      }),
    ).toBe(false);
  });
});
