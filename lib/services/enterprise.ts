import type { PropsApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise';
import { getJson } from './http';

export function getEnterprise() {
  return getJson<PropsApiEnterpriseResponse>('/api/protected/user/enterprise');
}
