import type { EnterpriseContext } from './enterprise.entity.ts';
import type { AuthUser } from './auth-user.entity.ts';

/**
 * Agregado com dados da empresa (enriquecidos com campos de auth.users) e do usuário autenticado.
 * Usado em: components/user/pages/profile/header.tsx.
 */
export interface EnterpriseAndUser {
  enterprise: EnterpriseContext;
  user: AuthUser['user'];
}
