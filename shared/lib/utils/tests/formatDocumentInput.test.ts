import { describe, it, expect } from 'vitest';
import { formatDocumentInput } from '../formatDocumentInput';

describe('formatDocumentInput Utility', () => {
  it('formata CPF completo', () => {
    expect(formatDocumentInput('12345678900', 'CPF')).toBe('123.456.789-00');
  });

  it('formata CNPJ completo', () => {
    expect(formatDocumentInput('12345678000199', 'CNPJ')).toBe('12.345.678/0001-99');
  });

  it('formata progressivamente CPF (parcial)', () => {
    expect(formatDocumentInput('1234', 'CPF')).toBe('123.4');
  });
});
