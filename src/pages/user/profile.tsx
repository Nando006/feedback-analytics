import Content from 'components/user/profile/content';
import Header from 'components/user/profile/header';
import Statistics from 'components/user/profile/statistics';

export default function Profile() {
  return (
    <div className="font-inter space-y-6">
      <Header />
      <Statistics />
      <Content />
    </div>
  );
}
