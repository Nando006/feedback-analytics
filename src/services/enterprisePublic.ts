import type { EnterprisePublicResponse } from 'lib/interfaces/public/enterprise';
import { getJson } from './http';

export function getEnterprisePublic(enterpriseId: string) {
  return getJson<EnterprisePublicResponse>(
    `/api/public/enterprise/${enterpriseId}`,
  );
}
