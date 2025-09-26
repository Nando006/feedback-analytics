import { describe, it, expect } from 'vitest';
import { formatDocument } from '../formatDocument';

describe('formatDocument Utility', () => {
  it('deve formatar um CPF corretamente', () => {
    const cpf = '12345678900';
    const formatted = formatDocument(cpf, 'CPF');
    expect(formatted).toBe('123.456.789-00');
  });

  it('deve formatar um CNPJ corretamente', () => {
    const cnpj = '12345678000199';
    const formatted = formatDocument(cnpj, 'CNPJ');
    expect(formatted).toBe('12.345.678/0001-99');
  });

  it('deve retornar apenas dígitos se o tipo for desconhecido', () => {
    const doc = '12345678';
    const formatted = formatDocument(doc);
    expect(formatted).toBe('12345678');
  });

  it('deve retornar uma string vazia para entrada nula ou vazia', () => {
    expect(formatDocument('')).toBe('');
  });
});
