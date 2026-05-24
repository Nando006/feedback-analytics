import { ServiceGetUser } from 'src/services/serviceUser';
import {
  ServiceGetCollectingDataEnterprise,
  ServiceGetEnterprise,
} from 'src/services/serviceEnterprise';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import type {
  ApiEnterpriseResponse,
  CollectingDataEnterprise,
  EnterpriseContext,
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

  const enterprise: EnterpriseContext = enterprisePayload?.enterprise
    ? {
        ...enterprisePayload.enterprise,
        email: user.email ?? null,
        phone: user.phone ?? null,
        full_name: user.user_metadata?.full_name ?? null,
      }
    : {
        id: '',
        document: '',
        created_at: '',
        trial_ends_at: null,
        subscription_status: 'TRIAL',
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