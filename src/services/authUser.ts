import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import { getJson } from './http';

export function getAuthUser() {
  return getJson<PropsAuthUser>('/api/protected/user/auth_user');
}
