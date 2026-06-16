import { describe, it, expect } from 'vitest';
import {
  extractAspects,
  clampScore,
  normalizeConfidence,
  scoreFromSentiment,
} from '../../services/aspectExtraction.service.js';
import type { IaAnalyzeFeedbackInput } from '../../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';

const feedback = {
  id: 'fb-1',
  message: 'O preço está caro mas o atendimento foi excelente',
  rating: 4,
  created_at: null,
  scope_type: 'COMPANY',
  collection_point: null,
  catalog_item: null,
  dynamic_answers: [],
  dynamic_subanswers: [],
} as unknown as IaAnalyzeFeedbackInput;

describe('[Unidade] extractAspects', () => {
  it('mantém aspectos ancorados na mensagem, valida sentimento e clampa o score', () => {
    const aspects = extractAspects(feedback, [
      { aspect: 'preço', sentiment: 'negative', sentiment_score: -0.5 },
      { aspect: 'atendimento', sentiment: 'positive', sentiment_score: 2 }, // clampa p/ 1
      { aspect: 'entrega', sentiment: 'negative' }, // não está na mensagem → descarta
      { aspect: 'preço', sentiment: 'neutral' }, // duplicado → descarta
      { aspect: 'qualidade', sentiment: 'amazing' }, // sentimento inválido → descarta
    ]);

    expect(aspects).toEqual([
      { aspect: 'preco', sentiment: 'negative', sentiment_score: -0.5 },
      { aspect: 'atendimento', sentiment: 'positive', sentiment_score: 1 },
    ]);
  });

  it('retorna [] quando rawAspects não é array', () => {
    expect(extractAspects(feedback, undefined)).toEqual([]);
    expect(extractAspects(feedback, 'nao-array')).toEqual([]);
    expect(extractAspects(feedback, null)).toEqual([]);
  });

  it('limita a 6 aspectos', () => {
    const message =
      'preco atendimento entrega qualidade embalagem prazo suporte garantia';
    const fb = { ...feedback, message } as IaAnalyzeFeedbackInput;
    const raw = ['preco', 'atendimento', 'entrega', 'qualidade', 'embalagem', 'prazo', 'suporte', 'garantia'].map(
      (aspect) => ({ aspect, sentiment: 'neutral' as const }),
    );
    expect(extractAspects(fb, raw)).toHaveLength(6);
  });
});

describe('[Unidade] clampScore / normalizeConfidence / scoreFromSentiment', () => {
  it('clampScore limita a [-1, 1]', () => {
    expect(clampScore(2)).toBe(1);
    expect(clampScore(-3)).toBe(-1);
    expect(clampScore(0.5)).toBe(0.5);
    expect(clampScore('x')).toBeUndefined();
    expect(clampScore(NaN)).toBeUndefined();
  });

  it('normalizeConfidence limita a [0, 1]', () => {
    expect(normalizeConfidence(1.5)).toBe(1);
    expect(normalizeConfidence(-0.2)).toBe(0);
    expect(normalizeConfidence(0.7)).toBe(0.7);
    expect(normalizeConfidence('x')).toBeUndefined();
  });

  it('scoreFromSentiment mapeia as classes', () => {
    expect(scoreFromSentiment('positive')).toBe(0.6);
    expect(scoreFromSentiment('negative')).toBe(-0.6);
    expect(scoreFromSentiment('neutral')).toBe(0);
  });
});
