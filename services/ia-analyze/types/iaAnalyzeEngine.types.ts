import type { IaAnalyzeFeedbackInput } from '../../../shared/interfaces/contracts/ia-analyze/input.contract.js';

/**
 * Tipos internos do motor de analise do dominio ia-analyze.
 * Centraliza contratos usados na sanitizacao de categorias e keywords.
 */

/**
 * Parametros para normalizar e filtrar uma lista de termos extraidos.
 * Serve para aplicar regras de grounding, deduplicacao e limite de quantidade.
 */
export type SanitizeTermListParams = {
  terms: string[];
  messageNormalized: string;
  forbiddenTerms: Set<string>;
  maxCount: number;
};

/**
 * Parametros para sanitizar o resultado de um feedback individual.
 * Serve para consolidar categories e keywords respeitando contexto textual.
 */
export type SanitizeAnalysisTermsParams = {
  feedback: IaAnalyzeFeedbackInput;
  categories: string[];
  keywords: string[];
};
