import Header from 'components/user/pages/profile/editUser/header';
import Information from 'components/user/pages/profile/editUser/information';
import Preferences from 'components/user/pages/profile/editUser/preferences';

export default function EditProfile() {
  return (
    <div className="font-work-sans space-y-6 pb-8">
      <Header />
      <Information />
      <Preferences />
    </div>
  );
}
