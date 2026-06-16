import { describe, it, expect } from 'vitest';
import {
  wilsonInterval,
  wilsonLowerBound,
  pctInterval,
  netSentimentScore,
  netSatisfaction,
  confidenceTier,
  ratingStats,
  csatTopTwoBox,
  bayesianAverage,
} from '../libs/statistics/index.js';

describe('[Unidade] statistics', () => {
  describe('wilsonInterval', () => {
    it('40/100 → ~[0.309, 0.498]', () => {
      const ci = wilsonInterval(40, 100);
      expect(ci.lower).toBeCloseTo(0.309, 2);
      expect(ci.upper).toBeCloseTo(0.498, 2);
    });

    it('limites ficam dentro de [0,1] em extremos', () => {
      const ci = wilsonInterval(0, 5);
      expect(ci.lower).toBeGreaterThanOrEqual(0);
      expect(ci.upper).toBeLessThanOrEqual(1);
      const full = wilsonInterval(5, 5);
      expect(full.upper).toBeLessThanOrEqual(1);
    });

    it('n=0 → [0,0]', () => {
      expect(wilsonInterval(0, 0)).toEqual({ lower: 0, upper: 0 });
    });
  });

  it('wilsonLowerBound penaliza amostra pequena (1/1 < 90/100)', () => {
    expect(wilsonLowerBound(1, 1)).toBeLessThan(wilsonLowerBound(90, 100));
  });

  it('pctInterval devolve porcentagem (0..100)', () => {
    const ci = pctInterval(40, 100);
    expect(ci.lower).toBeCloseTo(30.9, 1);
    expect(ci.upper).toBeCloseTo(49.8, 1);
  });

  describe('netSentimentScore', () => {
    it('600 pos / 200 neg / 1000 → +40', () => {
      expect(netSentimentScore(600, 200, 1000)).toBe(40);
    });
    it('total 0 → 0', () => {
      expect(netSentimentScore(0, 0, 0)).toBe(0);
    });
  });

  it('netSatisfaction = %(4-5) − %(1-2)', () => {
    expect(netSatisfaction(70, 10, 100)).toBe(60);
  });

  describe('confidenceTier', () => {
    it.each([
      [5, 'insufficient'],
      [9, 'insufficient'],
      [10, 'low'],
      [29, 'low'],
      [30, 'moderate'],
      [99, 'moderate'],
      [100, 'good'],
      [500, 'good'],
    ])('n=%i → %s', (n, tier) => {
      expect(confidenceTier(n as number)).toBe(tier);
    });
  });

  describe('ratingStats', () => {
    it('só notas 5 → média 5, sd 0, IC [5,5]', () => {
      const s = ratingStats({ 5: 10 });
      expect(s.n).toBe(10);
      expect(s.mean).toBe(5);
      expect(s.sd).toBe(0);
      expect(s.ci).toEqual({ lower: 5, upper: 5 });
    });

    it('metade 1 / metade 5 → média 3', () => {
      const s = ratingStats({ 1: 5, 5: 5 });
      expect(s.n).toBe(10);
      expect(s.mean).toBe(3);
      expect(s.sd).toBeGreaterThan(0);
      expect(s.ci.lower).toBeGreaterThanOrEqual(1);
      expect(s.ci.upper).toBeLessThanOrEqual(5);
    });

    it('vazio → zeros', () => {
      expect(ratingStats({})).toEqual({ n: 0, mean: 0, sd: 0, se: 0, ci: { lower: 0, upper: 0 } });
    });
  });

  describe('csatTopTwoBox', () => {
    it('6 de 10 satisfeitos (4-5) → 60%', () => {
      const c = csatTopTwoBox({ 1: 4, 4: 3, 5: 3 });
      expect(c.pct).toBe(60);
      expect(c.ci.lower).toBeGreaterThan(0);
      expect(c.ci.upper).toBeLessThanOrEqual(100);
    });
  });

  describe('bayesianAverage', () => {
    it('item 5,0 com 2 votos encolhe em direção à média global 4,0', () => {
      // (2*5 + 10*4)/(2+10) = 50/12 = 4.17
      expect(bayesianAverage(5, 2, 4, 10)).toBe(4.17);
    });
    it('m=0 → média do item', () => {
      expect(bayesianAverage(4.5, 3, 4, 0)).toBe(4.5);
    });
  });
});
