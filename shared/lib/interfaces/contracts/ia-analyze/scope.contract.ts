/**
 * Tipos base de escopo e sentimento do domínio IA Analyze.
 * Servem como fundamento para os contratos de API pública e integração remota.
 */
export type IaAnalyzeScopeType =
  | 'COMPANY'
  | 'PRODUCT'
  | 'SERVICE'
  | 'DEPARTMENT';

export type IaAnalyzeSentiment = 'positive' | 'neutral' | 'negative';
