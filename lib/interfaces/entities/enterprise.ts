export interface PropsEnterprise {
  id: string;
  document: string;
  account_type?: 'CPF' | 'CNPJ';
  terms_version?: string;
  terms_accepted_at?: string | null;
  created_at: string;
}

export interface PropsApiEnterpriseResponse {
  enterprise: PropsEnterprise;
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
  };
}
