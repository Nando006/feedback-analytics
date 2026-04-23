
import Information from 'components/user/pages/profile/editUser/information';
import { useNavigation, useRouteLoaderData } from 'react-router-dom';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import type { Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import Header from 'components/user/pages/profile/editUser/header';

export default function EditProfile() {
  const navigation = useNavigation();
  const { user, enterprise } = useRouteLoaderData('user') as {
    user: AuthUser['user'];
    enterprise: Enterprise;
    collecting: CollectingDataEnterprise | null;
  };

  const fullName = user.user_metadata?.full_name || enterprise.full_name || '';
  const email = user.email || '';
  const phone = user.phone || '';
  const isSavingProfile =
    navigation.state === 'submitting' &&
    navigation.formAction?.includes('/user/edit/profile');

  return (
    <div className="font-work-sans space-y-8 pb-12">
      <Header
        enterprise={enterprise}
        user={user}
      />

      <div className="relative px-4 space-y-8">
        <Information
          defaultFullName={fullName}
          defaultEmail={email}
          defaultPhone={phone}
        />

        {isSavingProfile && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
        )}
      </div>
    </div>
  );
}
