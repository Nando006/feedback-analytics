import { describe, it, expect } from 'vitest';
import { sentimentLabel } from '../sentiment';

describe('sentiment Utility', () => {
  it('mapeia labels corretamente', () => {
    expect(sentimentLabel('positive')).toBe('Positivo');
    expect(sentimentLabel('neutral')).toBe('Neutro');
    expect(sentimentLabel('negative')).toBe('Negativo');
  });
});
