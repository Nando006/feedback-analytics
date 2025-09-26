import { getAuthUser } from 'src/services/authUser';
import { getCollectingDataEnterprise } from 'src/services/collectingDataEnterprise';
import { getEnterprise } from 'src/services/enterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import type {
  PropsApiEnterpriseResponse,
  PropsCollectingDataEnterprise,
} from 'lib/interfaces/entities/enterprise';
import { redirect, type LoaderFunctionArgs } from 'react-router-dom';

export async function LoaderUserProtected(_args: LoaderFunctionArgs) {
  void _args;
  try {
    // Chamando as funções getAuthUser, getEnterprise e getCollectingDataEnterprise, lá de services.
    const [{ user }, enterprisePayload, collecting] = (await Promise.all([
      getAuthUser(),
      getEnterprise().catch(() => null),
      getCollectingDataEnterprise().catch(() => null),
    ])) as [
      PropsAuthUser,
      PropsApiEnterpriseResponse | null,
      PropsCollectingDataEnterprise | null,
    ];

    // Processando os dados da empresa. Se existir, adiciona o email e o telefone do usuário e o nome completo.
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

    // Retornando os dados da empresa.
    return {
      user,
      enterprise,
      collecting,
    };
  } catch {
    throw redirect('/login');
  }
}
