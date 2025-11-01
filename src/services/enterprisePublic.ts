import type { PropsEnterprisePublicResponse } from 'lib/interfaces/public/propsEnterprise';
import { getJson } from './http';

export function getEnterprisePublic(enterpriseId: string) {
  return getJson<PropsEnterprisePublicResponse>(
    `/api/public/enterprise/${enterpriseId}`,
  );
}
