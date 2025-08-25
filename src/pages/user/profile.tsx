import Info from 'components/user/profile/info';
import Header from 'components/user/profile/header';
import { useRouteLoaderData } from 'react-router-dom';
import type {
  PropsCollectingDataEnterprise,
  PropsEnterprise,
} from 'lib/interfaces/entities/enterprise';
import type { PropsAuthUser } from 'lib/interfaces/entities/authUser';

export default function Profile() {
  const { enterprise, user, collecting } = useRouteLoaderData('user') as {
    enterprise: PropsEnterprise;
    user: PropsAuthUser['user'];
    collecting: PropsCollectingDataEnterprise | null;
  };

  return (
    <div className="font-inter space-y-6">
      <Header
        enterprise={enterprise}
        user={user}
      />
      <Info
        enterprise={enterprise}
        collecting={collecting}
      />
    </div>
  );
}
