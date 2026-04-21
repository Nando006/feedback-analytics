/**
 * Normaliza textos para comparacoes sem ruido de acento, caixa e pontuacao.
 * Serve para validar termos extraidos da IA contra o texto original do feedback.
 * 
 * Transforma o texto do feedback numa forma canônica (ex: minúsculas, remover acentos/pontuação e espaços extras) para permitir comparações estáveis entre strings.
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
