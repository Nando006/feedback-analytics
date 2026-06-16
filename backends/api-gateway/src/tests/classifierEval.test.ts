import { describe, it, expect } from 'vitest';
import {
  cohensKappa,
  buildConfusionMatrix,
  classMetrics,
  interpretKappa,
} from '../libs/eval/classifierEval.js';

// Exemplo de referência: 10 pares (A/B).
// AA=5, BB=3, AB=1, BA=1 → Po=0.8, Pe=0.52, kappa=0.5833.
const pairs = [
  ...Array.from({ length: 5 }, () => ({ human: 'A', model: 'A' })),
  ...Array.from({ length: 3 }, () => ({ human: 'B', model: 'B' })),
  { human: 'A', model: 'B' },
  { human: 'B', model: 'A' },
];

describe('[Unidade] cohensKappa', () => {
  it('concordância perfeita → 1', () => {
    expect(
      cohensKappa([
        { human: 'A', model: 'A' },
        { human: 'A', model: 'A' },
        { human: 'B', model: 'B' },
      ]),
    ).toBe(1);
  });

  it('amostra vazia → 0', () => {
    expect(cohensKappa([])).toBe(0);
  });

  it('exemplo de referência ≈ 0.583', () => {
    expect(cohensKappa(pairs)).toBeCloseTo(0.583, 2);
  });
});

describe('[Unidade] classMetrics', () => {
  it('accuracy e macro-F1 do exemplo', () => {
    const { accuracy, macroF1, perClass } = classMetrics(pairs);
    expect(accuracy).toBeCloseTo(0.8, 5);
    // A: P=R=5/6 → F1≈0.833; B: P=R=3/4 → F1=0.75; macro≈0.792
    expect(macroF1).toBeCloseTo(0.792, 2);
    const a = perClass.find((c) => c.label === 'A')!;
    expect(a.support).toBe(6);
    expect(a.precision).toBeCloseTo(5 / 6, 4);
  });
});

describe('[Unidade] buildConfusionMatrix', () => {
  it('monta a matriz [human][model]', () => {
    const { labels, matrix } = buildConfusionMatrix(pairs);
    expect(labels).toEqual(['A', 'B']);
    expect(matrix.A.A).toBe(5);
    expect(matrix.B.B).toBe(3);
    expect(matrix.A.B).toBe(1);
    expect(matrix.B.A).toBe(1);
  });
});

describe('[Unidade] interpretKappa', () => {
  it.each([
    [-0.1, 'none'],
    [0, 'slight'],
    [0.2, 'slight'],
    [0.35, 'fair'],
    [0.55, 'moderate'],
    [0.75, 'substantial'],
    [0.9, 'almost_perfect'],
  ])('kappa=%s → %s', (kappa, band) => {
    expect(interpretKappa(kappa as number)).toBe(band);
  });
});
