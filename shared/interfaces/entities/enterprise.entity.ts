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
  trial_ends_at: string | null;
  subscription_status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELED';
}

/**
 * Enterprise enriquecido com dados de contato do usuário autenticado (auth.users).
 * Usado no frontend: os campos full_name/email/phone não existem na tabela enterprise,
 * mas são mesclados pelo loadUserContext para conveniência dos componentes.
 */
export type EnterpriseContext = Enterprise & {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

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
  company_feedback_questions?: CompanyFeedbackQuestion[];
  catalog_products?: CatalogItem[];
  catalog_services?: CatalogItem[];
  catalog_departments?: CatalogItem[];
  created_at: string;
  updated_at: string;
}

export interface CompanyFeedbackQuestion {
  id: string;
  enterprise_id: string;
  scope_type: 'COMPANY';
  catalog_item_id: null;
  question_order: 1 | 2 | 3;
  question_text: string;
  is_active: boolean;
  subquestions?: CompanyFeedbackSubquestion[];
  created_at: string;
  updated_at: string;
}

export interface CompanyFeedbackSubquestion {
  id: string;
  question_id: string;
  subquestion_order: 1 | 2 | 3;
  subquestion_text: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type CompanyFeedbackSubquestionInput = {
  subquestion_order: 1 | 2 | 3;
  subquestion_text: string;
  is_active?: boolean;
};

export type CompanyFeedbackQuestionInput = {
  question_order: 1 | 2 | 3;
  question_text: string;
  is_active?: boolean;
  subquestions?: CompanyFeedbackSubquestionInput[];
};

export type CatalogItemKind = 'PRODUCT' | 'SERVICE' | 'DEPARTMENT';

export interface CatalogItem {
  id: string;
  enterprise_id: string;
  kind: CatalogItemKind;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CatalogItemInput = {
  id?: string;
  name: string;
  description?: string | null;
  sort_order?: number;
  status?: 'ACTIVE' | 'INACTIVE';
};

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
> & {
  catalog_products?: CatalogItemInput[] | null;
  catalog_services?: CatalogItemInput[] | null;
  catalog_departments?: CatalogItemInput[] | null;
  company_feedback_questions?: CompanyFeedbackQuestionInput[] | null;
};

/**
 * Agregado da empresa com seus dados de coleta (quando existentes).
 * Usado em: components/user/pages/profile/info.tsx e pages/user/profile.tsx.
 */
export interface EnterpriseAndCollectingData {
  // enterprise vem enriquecido com full_name/email/phone (EnterpriseContext),
  // mesclados em runtime por loadUserContext — não são colunas da tabela enterprise.
  enterprise?: EnterpriseContext;
  collecting?: CollectingDataEnterprise | null;
}
