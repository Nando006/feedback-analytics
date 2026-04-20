import {
  type CollectingDataContext,
} from '../../repositories/iaAnalyze.repository.js';

/**
 * Monta o contexto da empresa para ser enviado à IA.
 *
 * Junta nome, objetivo, resumo do negócio e principais produtos/serviços
 * em um objeto padronizado, facilitando a análise contextualizada pela IA.
 *
 * Útil para garantir que a IA receba informações essenciais sobre a empresa
 * junto com os feedbacks, melhorando a qualidade das análises.
 */
export function buildEnterpriseContext(params: {
  enterpriseName: string | null;
  collecting: CollectingDataContext | null;
}) {
  const { enterpriseName, collecting } = params;

  return {
    enterprise_name: enterpriseName,
    company_objective: collecting?.company_objective ?? null,
    analytics_goal: collecting?.analytics_goal ?? null,
    business_summary: collecting?.business_summary ?? null,
    main_products_or_services: collecting?.main_products_or_services ?? null,
  };
}