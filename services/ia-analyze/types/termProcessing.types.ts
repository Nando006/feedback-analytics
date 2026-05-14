/**
 * Tipos do modulo de processamento de termos do dominio ia-analyze.
 * Centraliza contratos usados na sanitizacao e filtragem de listas de termos.
 */

export type SanitizeTermListParams = {
  terms: string[];
  messageNormalized: string;
  forbiddenTerms: Set<string>;
  maxCount: number;
};
