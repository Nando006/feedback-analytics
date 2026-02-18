import type { Enterprise } from './enterprise.entity.ts';
import type { AuthUser } from './auth-user.entity.ts';

export interface EnterpriseAndUser {
  enterprise: Enterprise;
  user: AuthUser['user'];
}
