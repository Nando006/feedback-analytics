import type { Enterprise } from './enterprise.entity.ts';
import type { AuthUser } from './auth-user.entity.ts';

/**
 * Agregado com dados da empresa e do usuário autenticado associado.
 * Usado em: components/user/pages/profile/header.tsx.
 */
export interface EnterpriseAndUser {
  enterprise: Enterprise;
  user: AuthUser['user'];
}
