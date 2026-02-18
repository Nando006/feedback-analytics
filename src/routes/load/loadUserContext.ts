import { ServiceGetUser } from 'src/services/serviceUser';
import {
  ServiceGetCollectingDataEnterprise,
  ServiceGetEnterprise,
} from 'src/services/serviceEnterprise';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import type {
  ApiEnterpriseResponse,
  CollectingDataEnterprise,
} from 'lib/interfaces/entities/enterprise.entity';

export async function loadUserContextData() {
  const [auth, enterprisePayload] = (await Promise.all([
    ServiceGetUser(),
    ServiceGetEnterprise().catch(() => null),
  ])) as [AuthUser, ApiEnterpriseResponse | null];

  const user = auth.user;
  const collecting = enterprisePayload
    ? ((await ServiceGetCollectingDataEnterprise().catch(
        () => null,
      )) as CollectingDataEnterprise | null)
    : null;

  const enterprise = enterprisePayload?.enterprise
    ? {
        ...enterprisePayload.enterprise,
        email: user.email ?? null,
        phone: user.phone ?? null,
        full_name: user.user_metadata?.full_name ?? null,
      }
    : {
        document: '',
        email: user.email ?? null,
        phone: user.phone ?? null,
        full_name: user.user_metadata?.full_name ?? null,
      };

  return {
    user,
    enterprise,
    collecting,
  };
}