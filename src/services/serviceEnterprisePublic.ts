import type { PropsEnterprisePublicResponse } from 'lib/interfaces/public/propsEnterprise';
import { getJson } from './http';

export function ServiceGetEnterprisePublic(enterpriseId: string) {
  return getJson<PropsEnterprisePublicResponse>(
    `/api/public/enterprise/${enterpriseId}`,
  );
}
