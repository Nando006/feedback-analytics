import { getAuthUser, getEnterprise } from 'lib/api/get';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import type { PropsApiEnterpriseResponse } from 'lib/interfaces/entities/enterprise';
import { redirect, type LoaderFunctionArgs } from 'react-router-dom';

export async function LoaderUserProtected(_args: LoaderFunctionArgs) {
  try {
    const [{ user }, enterprisePayload] = (await Promise.all([
      getAuthUser(),
      getEnterprise().catch(() => null),
    ])) as [PropsAuthUser, PropsApiEnterpriseResponse | null];

    const enterprise = enterprisePayload?.enterprise ?? {
      name:
        (user.user_metadata as any)?.full_name ||
        'Empresa',
      document: '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    };

    return {
      user,
      enterprise,
    };
  } catch (error) {
    throw redirect('/login');
  }
}
