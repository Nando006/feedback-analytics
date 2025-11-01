import Header from 'components/user/profile/editUser/header';
import Info from 'components/user/profile/editUser/information';
import Preferences from 'components/user/profile/editUser/preferences';

export default function EditProfile() {
  return (
    <div className="font-inter space-y-6">
      <Header />
      <Info />
      <Preferences />
    </div>
  );
}
