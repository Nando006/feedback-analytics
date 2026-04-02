import Header from 'components/user/pages/profile/editUser/header';
import Information from 'components/user/pages/profile/editUser/information';
import { useRouteLoaderData } from 'react-router-dom';
import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import type { Enterprise } from 'lib/interfaces/entities/enterprise.entity';
import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';

export default function EditProfile() {
  const { user, enterprise } = useRouteLoaderData('user') as {
    user: AuthUser['user'];
    enterprise: Enterprise;
    collecting: CollectingDataEnterprise | null;
  };

  // Debug logs para verificar dados
  console.log('=== DEBUG EditProfile ===');
  console.log('User object:', JSON.stringify(user, null, 2));
  console.log('Enterprise object:', JSON.stringify(enterprise, null, 2));
  console.log('User metadata:', JSON.stringify(user.user_metadata, null, 2));
  console.log('Full name sources:', {
    userMetadata: user.user_metadata?.full_name,
    userMetadataType: typeof user.user_metadata?.full_name,
    enterprise: enterprise.full_name,
    enterpriseType: typeof enterprise.full_name,
  });

  const fullName = user.user_metadata?.full_name || enterprise.full_name || '';
  const email = user.email || '';
  const phone = user.phone || '';

  console.log('Final values being passed:', {
    fullName,
    fullNameType: typeof fullName,
    email,
    emailType: typeof email,
    phone,
    phoneType: typeof phone,
  });

  return (
    <div className="font-work-sans space-y-8 pb-12 max-w-4xl mx-auto">
      <Header />

      <div className="px-4 space-y-8">
        <Information
          defaultFullName={fullName}
          defaultEmail={email}
          defaultPhone={phone}
        />
      </div>
    </div>
  );
}
