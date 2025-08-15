import { getJson } from './http';
import { type PropsAuthUser } from 'lib/interfaces/entities/authUser';
import { type PropsApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise';

export function getAuthUser() {
  return getJson<PropsAuthUser>('/api/user/auth_user');
}

export function getEnterprise() {
  return getJson<PropsApiEnterpriseResponse>('/api/user/enterprise');
}
