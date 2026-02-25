import { describe, it, expect } from 'vitest';
import { getPasswordStrength } from '../passwordStrength';

describe('passwordStrength Utility', () => {
  it('retorna estado inicial quando vazio', () => {
    const s = getPasswordStrength('');
    expect(s.showBar).toBe(false);
    expect(s.percent).toBe(0);
    expect(s.label).toBe('Muito fraca');
  });

  it('classifica uma senha fraca', () => {
    const s = getPasswordStrength('abc');
    expect(s.showBar).toBe(true);
    expect(s.percent).toBe(25);
    expect(s.label).toBe('Fraca');
    expect(s.color).toBe('bg-red-500');
  });

  it('classifica uma senha muito forte', () => {
    const s = getPasswordStrength('Abcdef1!');
    expect(s.percent).toBe(100);
    expect(s.label).toBe('Muito forte');
    expect(s.color).toBe('bg-purple-600');
  });
});
