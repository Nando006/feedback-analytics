import { ServiceGetUser } from 'src/services/serviceUser';
import { ServiceGetCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import { ServiceGetEnterprise } from 'src/services/serviceEnterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';
import type {
  PropsApiEnterpriseResponse,
  PropsCollectingDataEnterprise,
} from 'lib/interfaces/entities/enterprise';
import { redirect, type LoaderFunctionArgs } from 'react-router-dom';

export async function LoaderUserProtected(_args: LoaderFunctionArgs) {
  void _args;
  try {
    // Carrega usuário e empresa; busca coleta somente se houver empresa para evitar 404 no console.
    const [auth, enterprisePayload] = (await Promise.all([
      ServiceGetUser(),
      ServiceGetEnterprise().catch(() => null),
    ])) as [PropsAuthUser, PropsApiEnterpriseResponse | null];

    const user = auth.user;
    const collecting = enterprisePayload
      ? ((await ServiceGetCollectingDataEnterprise().catch(
          () => null,
        )) as PropsCollectingDataEnterprise | null)
      : null;

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
