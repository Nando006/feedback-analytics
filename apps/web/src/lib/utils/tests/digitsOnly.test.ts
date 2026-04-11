import { describe, it, expect } from 'vitest';
import { digitsOnly } from '../digitsOnly';

describe('digitsOnly Utility', () => {
  it('remove tudo que não for dígito', () => {
    expect(digitsOnly('+55 (11) 9 8765-4321')).toBe('5511987654321');
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(digitsOnly('')).toBe('');
  });
});
