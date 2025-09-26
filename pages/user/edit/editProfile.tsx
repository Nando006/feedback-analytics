import Header from 'components/user/profile/edit/header';
import Info from 'components/user/profile/edit/information';
import Preferences from 'components/user/profile/edit/preferences';

export default function EditProfile() {
  return (
    <div className="font-inter space-y-6">
      <Header />
      <Info />
      <Preferences />
    </div>
  );
}
