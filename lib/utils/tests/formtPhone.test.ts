import { describe, it, expect } from 'vitest';
import { formatPhone } from '../formatPhone';

describe('formatPhone Utility', () => {
  it('deve formatar um número de celular com 11 dígitos corretamente', () => {
    const phone = '11987654321';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('(11) 9 8765-4321');
  });

  it('deve formatar um número fixo com 10 dígitos corretamente', () => {
    const phone = '1134567890';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('(11) 3456-7890');
  });

  it('deve formatar número com código do país +55', () => {
    const phone = '5511987654321';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('+55 (11) 9 8765-4321');
  });

  it('deve formatar número fixo com código do país +55', () => {
    const phone = '55113456789';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('+55 113456789');
  });

  it('deve normalizar números com mais de 11 dígitos mantendo os últimos 11', () => {
    const phone = '123456789011987654321';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('(11) 9 8765-4321');
  });

  it('deve remover caracteres não numéricos', () => {
    const phone = '(11) 9 8765-4321';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('(11) 9 8765-4321');
  });

  it('deve lidar com números parciais', () => {
    const phone = '119876';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('119876');
  });

  it('deve retornar string vazia para entrada vazia', () => {
    expect(formatPhone('')).toBe('');
  });

  it('deve tratar números que começam com 55 como DDI', () => {
    const phone = '55987654321';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('+55 987654321');
  });

  it('deve formatar número com DDI e caracteres especiais', () => {
    const phone = '+55 (11) 9 8765-4321';
    const formatted = formatPhone(phone);
    expect(formatted).toBe('+55 (11) 9 8765-4321');
  });
});
