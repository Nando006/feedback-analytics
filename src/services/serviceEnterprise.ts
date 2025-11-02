import type { PropsApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise';
import { getJson } from './http';

export function ServiceGetEnterprise() {
  return getJson<PropsApiEnterpriseResponse>('/api/protected/user/enterprise');
}
