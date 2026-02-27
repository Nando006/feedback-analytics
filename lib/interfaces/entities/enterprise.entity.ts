/**
 * Entidade principal de empresa cadastrada na plataforma.
 * Usado em: layouts/user.tsx, pages/user/qrcodes/qrcodeEnterprise.tsx e src/routes/load/loadUserContext.ts.
 */
export interface Enterprise {
  id: string;
  document: string;
  account_type?: 'CPF' | 'CNPJ';
  terms_version?: string;
  terms_accepted_at?: string | null;
  created_at: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

/**
 * Resposta de API com empresa e, opcionalmente, usuário relacionado.
 * Usado em: src/services/serviceEnterprise.ts.
 */
export interface ApiEnterpriseResponse {
  enterprise: Enterprise;
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
  };
}

/**
 * Dados de coleta de contexto de negócio para análises de feedback.
 * Usado em: layouts/user.tsx, components/user/layout/ui.types.ts, pages/user/profile.tsx e src/services/serviceEnterprise.ts.
 */
export interface CollectingDataEnterprise {
  id: string;
  enterprise_id: string;
  company_objective: string | null;
  analytics_goal: string | null;
  business_summary: string | null;
  main_products_or_services: string[] | null;
  uses_company_products: boolean;
  uses_company_services: boolean;
  uses_company_departments: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Payload parcial para atualização dos dados de coleta da empresa.
 * Usado em: src/services/serviceEnterprise.ts.
 */
export type UpdateCollectingDataPayload = Partial<
  Pick<
    CollectingDataEnterprise,
    | 'company_objective'
    | 'analytics_goal'
    | 'business_summary'
    | 'main_products_or_services'
    | 'uses_company_products'
    | 'uses_company_services'
    | 'uses_company_departments'
  >
>;

/**
 * Agregado da empresa com seus dados de coleta (quando existentes).
 * Usado em: components/user/pages/profile/info.tsx e pages/user/profile.tsx.
 */
export interface EnterpriseAndCollectingData {
  enterprise: Enterprise;
  collecting: CollectingDataEnterprise | null;
}
