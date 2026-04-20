import {
  type CollectingDataContext,
} from '../../repositories/iaAnalyze.repository.js';

/**
 * Verifica se a empresa possui informações mínimas para análise IA.
 *
 * Checa se objetivo, meta analítica e resumo do negócio estão preenchidos.
 * Retorna true só se todos esses campos existirem e não forem vazios.
 *
 * Útil para evitar rodar análise IA sem contexto suficiente, garantindo qualidade.
 */
export function hasRequiredEnterpriseInfoForAnalysis(
  collecting: CollectingDataContext | null,
) {
  if (!collecting) {
    return false;
  }

  const hasCompanyObjective = String(collecting.company_objective ?? '').trim().length > 0;
  const hasAnalyticsGoal = String(collecting.analytics_goal ?? '').trim().length > 0;
  const hasBusinessSummary = String(collecting.business_summary ?? '').trim().length > 0;

  return hasCompanyObjective && hasAnalyticsGoal && hasBusinessSummary;
}