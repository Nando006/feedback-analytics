export interface PropsEnterprise {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface PropsApiEnterpriseResponse {
  enterprise: PropsEnterprise;
  user?: {
    id: string;
    email: string | null;
  };
}
