import type { CollectingDataContext } from "../../types/iaAnalyze.types";


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

/**
 * Quantidade mínima de feedbacks exigida para que a análise IA seja considerada relevante.
 *
 * Se houver menos que esse valor, a análise é abortada e retorna erro.
 *
 * Ajuda a evitar análises estatisticamente frágeis ou sem valor.
 */
export const MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS = 10;
