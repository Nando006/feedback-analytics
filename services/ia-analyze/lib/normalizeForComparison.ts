/**
 * Normaliza textos para comparacoes sem ruido de acento, caixa e pontuacao.
 * Serve para validar termos extraidos da IA contra o texto original do feedback.
 */
export function normalizeForComparison(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
