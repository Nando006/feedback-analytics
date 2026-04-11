import { describe, it, expect } from 'vitest';
import { formatPhoneInputBR } from '../formatPhoneInputBR';

describe('formatPhoneInputBR Utility', () => {
  it('formata celular completo (11 dígitos + DDD) com +55', () => {
    expect(formatPhoneInputBR('11987654321')).toBe('+55 (11) 98765-4321');
  });

  it('aceita entrada já com 55 e mantém o formato', () => {
    expect(formatPhoneInputBR('5511987654321')).toBe('+55 (11) 98765-4321');
  });

  it('formata progressivamente para entradas curtas', () => {
    expect(formatPhoneInputBR('1')).toBe('+55 (1)');
    expect(formatPhoneInputBR('11')).toBe('+55 (11)');
    expect(formatPhoneInputBR('1198')).toBe('+55 (11) 98');
  });
});
