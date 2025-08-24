export interface PropsEnterprise {
  id: string;
  document: string;
  account_type?: 'CPF' | 'CNPJ';
  terms_version?: string;
  terms_accepted_at?: string | null;
  created_at: string;

  // Dados vindo de auth.user e metadata, opcionais
  full_name?: string | null; // metadata
  email?: string | null; // auth.user
  phone?: string | null;
}

export interface PropsApiEnterpriseResponse {
  enterprise: PropsEnterprise;
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
  };
}

export interface PropsCollectingDataEnterprise {
  id: string;
  enterprise_id: string;
  company_objective: string | null;
  analytics_goal: string | null;
  business_summary: string | null;
  main_products_or_services: string[] | null;
  created_at: string;
  updated_at: string;
}
export type TypeUpdateCollectingDataPayload = Partial<
  Pick<
    PropsCollectingDataEnterprise,
    | 'company_objective'
    | 'analytics_goal'
    | 'business_summary'
    | 'main_products_or_services'
  >
>;
