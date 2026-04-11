import { describe, it, expect } from 'vitest';
import { truncateText, useTruncatedText } from '../truncateText';

describe('truncateText Utility', () => {
  it('deve retornar texto completo quando menor que o limite padrão', () => {
    const text = 'Texto curto';
    const result = truncateText(text);

    expect(result.display).toBe('Texto curto');
    expect(result.full).toBe('Texto curto');
    expect(result.isTruncated).toBe(false);
  });

  it('deve truncar texto quando maior que o limite padrão (20 caracteres)', () => {
    const text = 'Este é um texto muito longo que precisa ser truncado';
    const result = truncateText(text);

    expect(result.display).toBe('Este é um texto muit...');
    expect(result.full).toBe(
      'Este é um texto muito longo que precisa ser truncado',
    );
    expect(result.isTruncated).toBe(true);
  });

  it('deve usar limite personalizado', () => {
    const text = 'Texto com limite personalizado';
    const result = truncateText(text, 10);

    expect(result.display).toBe('Texto com ...');
    expect(result.full).toBe('Texto com limite personalizado');
    expect(result.isTruncated).toBe(true);
  });

  it('deve retornar texto completo quando igual ao limite', () => {
    const text = 'Exatamente20caractrs';
    const result = truncateText(text, 20);

    expect(result.display).toBe('Exatamente20caractrs');
    expect(result.full).toBe('Exatamente20caractrs');
    expect(result.isTruncated).toBe(false);
  });

  it('deve lidar com texto vazio', () => {
    const result = truncateText('');

    expect(result.display).toBe('');
    expect(result.full).toBe('');
    expect(result.isTruncated).toBe(false);
  });

  it('deve lidar com limite zero', () => {
    const text = 'Qualquer texto';
    const result = truncateText(text, 0);

    expect(result.display).toBe('...');
    expect(result.full).toBe('Qualquer texto');
    expect(result.isTruncated).toBe(true);
  });

  it('deve lidar com limite negativo', () => {
    const text = 'Texto com limite negativo';
    const result = truncateText(text, -5);

    expect(result.display).toBe('Texto com limite neg...');
    expect(result.full).toBe('Texto com limite negativo');
    expect(result.isTruncated).toBe(true);
  });
});

describe('useTruncatedText Hook', () => {
  it('deve retornar props vazias para texto não truncado', () => {
    const text = 'Texto curto';
    const result = useTruncatedText(text);

    expect(result.display).toBe('Texto curto');
    expect(result.full).toBe('Texto curto');
    expect(result.isTruncated).toBe(false);
    expect(result.props).toEqual({});
  });

  it('deve retornar props com title e className para texto truncado', () => {
    const text = 'Este é um texto muito longo que será truncado';
    const result = useTruncatedText(text);

    expect(result.display).toBe('Este é um texto muit...');
    expect(result.full).toBe('Este é um texto muito longo que será truncado');
    expect(result.isTruncated).toBe(true);
    expect(result.props).toEqual({
      title: 'Este é um texto muito longo que será truncado',
      className: 'cursor-help',
    });
  });

  it('deve usar limite personalizado no hook', () => {
    const text = 'Texto para teste do hook';
    const result = useTruncatedText(text, 8);

    expect(result.display).toBe('Texto pa...');
    expect(result.full).toBe('Texto para teste do hook');
    expect(result.isTruncated).toBe(true);
    expect(result.props).toEqual({
      title: 'Texto para teste do hook',
      className: 'cursor-help',
    });
  });

  it('deve lidar com texto vazio no hook', () => {
    const result = useTruncatedText('');

    expect(result.display).toBe('');
    expect(result.full).toBe('');
    expect(result.isTruncated).toBe(false);
    expect(result.props).toEqual({});
  });
});
