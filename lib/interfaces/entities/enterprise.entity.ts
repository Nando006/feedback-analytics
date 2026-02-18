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

export interface ApiEnterpriseResponse {
  enterprise: Enterprise;
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
  };
}

export interface CollectingDataEnterprise {
  id: string;
  enterprise_id: string;
  company_objective: string | null;
  analytics_goal: string | null;
  business_summary: string | null;
  main_products_or_services: string[] | null;
  uses_company_products: boolean;
  created_at: string;
  updated_at: string;
}

export type UpdateCollectingDataPayload = Partial<
  Pick<
    CollectingDataEnterprise,
    | 'company_objective'
    | 'analytics_goal'
    | 'business_summary'
    | 'main_products_or_services'
    | 'uses_company_products'
  >
>;

export interface EnterpriseAndCollectingData {
  enterprise: Enterprise;
  collecting: CollectingDataEnterprise | null;
}
