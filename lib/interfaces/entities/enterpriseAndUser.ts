import type { PropsEnterprise } from 'lib/interfaces/entities/enterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';

export interface PropsEnterpriseAndUser {
  enterprise: PropsEnterprise;
  user: PropsAuthUser['user'];
}
