import type { PropsEnterprise } from 'lib/interfaces/entities/enterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';

// Dados da empresa e do usuário.
export interface PropsEnterpriseAndUser {
  enterprise: PropsEnterprise;
  user: PropsAuthUser['user'];
}
