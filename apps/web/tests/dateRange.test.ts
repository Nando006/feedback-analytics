import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculatePresetRange, calculateReferenceRange } from '../src/lib/utils/dateRange';

describe('dateRange utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculatePresetRange para this_month', () => {
    // Definir data como 15 de Julho de 2026
    const mockDate = new Date(2026, 6, 15, 12, 0, 0);
    vi.setSystemTime(mockDate);

    const range = calculatePresetRange('this_month');
    // Esperado: 01/07/2026 00:00:00 local a 15/07/2026 23:59:59.999 local
    expect(range.startDate).toBe(new Date(2026, 6, 1, 0, 0, 0, 0).toISOString());
    expect(range.endDate).toBe(new Date(2026, 6, 15, 23, 59, 59, 999).toISOString());
  });

  it('calculateReferenceRange para this_month no período anterior (previous_period)', () => {
    // Definir data como 15 de Julho de 2026
    const mockDate = new Date(2026, 6, 15, 12, 0, 0);
    vi.setSystemTime(mockDate);

    const range = calculateReferenceRange('this_month', undefined, undefined, 'previous_period');
    // Esperado: 01/06/2026 00:00:00 local a 15/06/2026 23:59:59.999 local
    expect(range.startDate).toBe(new Date(2026, 5, 1, 0, 0, 0, 0).toISOString());
    expect(range.endDate).toBe(new Date(2026, 5, 15, 23, 59, 59, 999).toISOString());
  });

  it('evita estouro de mês/rollover no final de meses com mais dias (ex: 31 de Março -> Fevereiro)', () => {
    // Definir data como 31 de Março de 2026 (Fevereiro tem 28 dias)
    const mockDate = new Date(2026, 2, 31, 12, 0, 0);
    vi.setSystemTime(mockDate);

    const range = calculateReferenceRange('this_month', undefined, undefined, 'previous_period');
    // Esperado: 01/02/2026 00:00:00 a 28/02/2026 23:59:59.999 (sem estourar para Março)
    expect(range.startDate).toBe(new Date(2026, 1, 1, 0, 0, 0, 0).toISOString());
    expect(range.endDate).toBe(new Date(2026, 1, 28, 23, 59, 59, 999).toISOString());
  });

  it('evita estouro de mês/rollover em ano bissexto (ex: 31 de Março de 2028 -> Fevereiro de 2028 tem 29 dias)', () => {
    // Definir data como 31 de Março de 2028 (Ano bissexto, Fevereiro tem 29 dias)
    const mockDate = new Date(2028, 2, 31, 12, 0, 0);
    vi.setSystemTime(mockDate);

    const range = calculateReferenceRange('this_month', undefined, undefined, 'previous_period');
    // Esperado: 01/02/2028 00:00:00 a 29/02/2028 23:59:59.999
    expect(range.startDate).toBe(new Date(2028, 1, 1, 0, 0, 0, 0).toISOString());
    expect(range.endDate).toBe(new Date(2028, 1, 29, 23, 59, 59, 999).toISOString());
  });

  it('calculateReferenceRange para last_month no ano anterior (previous_year)', () => {
    const mockDate = new Date(2026, 6, 15, 12, 0, 0);
    vi.setSystemTime(mockDate);

    const range = calculateReferenceRange('last_month', undefined, undefined, 'previous_year');
    // Mês passado é Junho (01/06/2026 - 30/06/2026).
    // Esperado mesmo período ano passado: Junho/2025 (01/06/2025 - 30/06/2025).
    expect(range.startDate).toBe(new Date(2025, 5, 1, 0, 0, 0, 0).toISOString());
    expect(range.endDate).toBe(new Date(2025, 5, 30, 23, 59, 59, 999).toISOString());
  });
});
