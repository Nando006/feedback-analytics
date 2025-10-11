import type { PropsEnterprise } from './enterprise.ts';
import type { PropsAuthUser } from './authUser.ts';

// Dados da empresa e do usuário.
export interface PropsEnterpriseAndUser {
  enterprise: PropsEnterprise;
  user: PropsAuthUser['user'];
}
