import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import { getJson } from './http';

export function ServiceGetUser() {
  return getJson<PropsAuthUser>('/api/protected/user/auth_user');
}
