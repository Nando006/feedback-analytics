import { normalizeForComparison } from '../utils/normalizeForComparison.js';
import type { IaAnalyzeScopeType } from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

/**
 * Taxonomia fixa de categorias (drivers de CX) por escopo — coding dedutivo.
 *
 * Torna as categorias COMPARÁVEIS e TENDENCIÁVEIS: a saída livre da IA é mapeada
 * para um rótulo canônico quando bate com o canônico ou um sinônimo; quando não
 * bate, o termo é mantido como "emergente" (sem perda de sinal).
 *
 * Os rótulos canônicos seguem o estilo já produzido pelo saneamento
 * (`normalizeForComparison`: minúsculas, sem acento), para casar na deduplicação.
 * Semeada a partir das listas de `prompts/scopeInstructions.ts`.
 */
type TaxonomyNode = { canonical: string; synonyms: string[] };

const TAXONOMY_BY_SCOPE: Record<IaAnalyzeScopeType, TaxonomyNode[]> = {
  COMPANY: [
    { canonical: 'atendimento', synonyms: ['suporte', 'atendente', 'equipe', 'staff'] },
    { canonical: 'comunicacao', synonyms: ['comunicação', 'informacao', 'informação', 'aviso'] },
    { canonical: 'preco', synonyms: ['preço', 'valor', 'custo', 'caro', 'barato', 'custo-beneficio'] },
    { canonical: 'ambiente', synonyms: ['local', 'limpeza', 'estrutura', 'instalacoes', 'instalações'] },
    { canonical: 'experiencia geral', synonyms: ['experiencia', 'experiência'] },
    { canonical: 'confianca', synonyms: ['confiança', 'seguranca', 'segurança'] },
  ],
  PRODUCT: [
    { canonical: 'qualidade', synonyms: ['acabamento'] },
    { canonical: 'durabilidade', synonyms: ['resistencia', 'resistência', 'durou'] },
    { canonical: 'custo-beneficio', synonyms: ['custo-benefício', 'preco', 'preço', 'valor', 'caro'] },
    { canonical: 'funcionalidades', synonyms: ['funcionalidade', 'recursos', 'funcao', 'função'] },
    { canonical: 'embalagem', synonyms: ['pacote', 'caixa'] },
  ],
  SERVICE: [
    { canonical: 'tempo de resposta', synonyms: ['demora', 'rapidez', 'espera', 'lento'] },
    { canonical: 'eficiencia', synonyms: ['eficiência', 'efetividade', 'agilidade'] },
    { canonical: 'cordialidade', synonyms: ['educacao', 'educação', 'simpatia', 'atencao', 'atenção'] },
    { canonical: 'clareza', synonyms: ['explicacao', 'explicação', 'transparencia', 'transparência'] },
    { canonical: 'resolucao de problemas', synonyms: ['resolucao', 'resolução', 'solucao', 'solução', 'resolveu'] },
  ],
  DEPARTMENT: [
    { canonical: 'processo interno', synonyms: ['processo', 'burocracia', 'fluxo'] },
    { canonical: 'comunicacao da equipe', synonyms: ['comunicacao', 'comunicação', 'alinhamento'] },
    { canonical: 'agilidade', synonyms: ['rapidez', 'demora', 'velocidade'] },
    { canonical: 'qualidade da interacao', synonyms: ['interacao', 'interação', 'relacionamento'] },
  ],
};

/** Lookup (normalizado → canônico) por escopo, com cache. */
const lookupCache = new Map<IaAnalyzeScopeType, Map<string, string>>();

function getLookup(scope: IaAnalyzeScopeType): Map<string, string> {
  const cached = lookupCache.get(scope);
  if (cached) return cached;

  const lookup = new Map<string, string>();
  for (const node of TAXONOMY_BY_SCOPE[scope]) {
    const canonical = normalizeForComparison(node.canonical);
    lookup.set(canonical, canonical);
    for (const synonym of node.synonyms) {
      const key = normalizeForComparison(synonym);
      if (key) lookup.set(key, canonical);
    }
  }
  lookupCache.set(scope, lookup);
  return lookup;
}

/** Rótulos canônicos do escopo (para nudge no prompt). */
export function getTaxonomyLabels(scope: IaAnalyzeScopeType): string[] {
  return TAXONOMY_BY_SCOPE[scope].map((node) => node.canonical);
}

/**
 * Mapeia categorias (já saneadas/normalizadas) para a taxonomia do escopo.
 * - match exato (canônico/sinônimo) → canônico;
 * - senão, se algum TOKEN da categoria for chave → canônico;
 * - senão, mantém o termo como emergente.
 * Deduplica preservando a ordem.
 */
export function canonicalizeCategories(scope: IaAnalyzeScopeType, categories: string[]): string[] {
  const lookup = getLookup(scope);
  const out: string[] = [];
  const seen = new Set<string>();

  for (const category of categories) {
    const norm = normalizeForComparison(category);
    if (!norm) continue;

    let canonical = lookup.get(norm);
    if (!canonical) {
      for (const token of norm.split(' ')) {
        const hit = lookup.get(token);
        if (hit) {
          canonical = hit;
          break;
        }
      }
    }
    const value = canonical ?? norm;

    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }

  return out;
}
