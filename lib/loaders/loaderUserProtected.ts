import { getAuthUser } from 'lib/api/authUser';
import { getEnterprise } from 'lib/api/enterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import type { PropsApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise';
import { redirect, type LoaderFunctionArgs } from 'react-router-dom';

export async function LoaderUserProtected(_args: LoaderFunctionArgs) {
  try {
    const [{ user }, enterprisePayload] = (await Promise.all([
      getAuthUser(),
      getEnterprise().catch(() => null),
    ])) as [PropsAuthUser, PropsApiEnterpriseResponse | null];

    const enterprise = enterprisePayload?.enterprise
      ? {
          ...enterprisePayload.enterprise,
          email: user.email ?? null,
          phone: user.phone ?? null,
          full_name: (user.user_metadata as any)?.full_name ?? null,
        }
      : {
          document: '',
          email: user.email ?? null,
          phone: user.phone ?? null,
          full_name: (user.user_metadata as any)?.full_name ?? null,
        };

    return {
      user,
      enterprise,
    };
  } catch (error) {
    throw redirect('/login');
  }
}
