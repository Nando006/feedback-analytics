import { normalizeForComparison } from '../utils/normalizeForComparison.js';
import {
  buildForbiddenTerms,
  sanitizeTermList,
} from '../lib/termProcessing.js';
import { canonicalizeCategories } from '../lib/categoryTaxonomy.js';
import type { IaAnalyzeFeedbackInput } from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import type { IaAnalyzeScopeType } from '../../../../shared/interfaces/contracts/ia-analyze/scope.contract.js';

/**
 * Essa função ela extraí categorias que realmente fazem sentido ser extraídas
 * 
 * rawCategories (lista de categorias brutas): lista inicial de strings sugeridas como categorias (por exemplo, saída de um modelo ou heurística), possivelmente com ruído e duplicatas.
 * 
 * fallbackKeywords: Lista de palavras-chave de reserva, usada quando nenhuma categoria válida é extraída - O código retorna fallbackKeywords.slice(0, 2).
 * 
 * "Lista de categorias brutas" = rawCategories: É o mesmo conceito, só outra forma de dizer.
 * 
 */
export function extractCategories(
  feedback: IaAnalyzeFeedbackInput,
  rawCategories: string[],
  fallbackKeywords: string[],
  scopeType: IaAnalyzeScopeType,
): string[] {
  const messageNormalized = normalizeForComparison(feedback.message ?? '');
  const forbiddenTerms = buildForbiddenTerms(feedback);

  const categories = sanitizeTermList({
    terms: rawCategories,
    messageNormalized,
    forbiddenTerms,
    maxCount: 4,
  });

  // Mapeia para a taxonomia fixa do escopo (canônicos + emergentes).
  const base = categories.length === 0 ? fallbackKeywords.slice(0, 2) : categories;
  return canonicalizeCategories(scopeType, base);
}