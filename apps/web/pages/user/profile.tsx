import Info from 'components/user/pages/profile/info';
import Header from 'components/user/pages/profile/header';
import { useRouteLoaderData } from 'react-router-dom';
import type {
  CollectingDataEnterprise,
  Enterprise,
} from 'lib/interfaces/entities/enterprise.entity';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';

export default function Profile() {
  const { enterprise, user, collecting } = useRouteLoaderData('user') as {
    enterprise: Enterprise;
    user: AuthUser['user'];
    collecting: CollectingDataEnterprise | null;
  };

  return (
    <div className="font-work-sans space-y-6">
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
