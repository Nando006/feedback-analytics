import Header from 'components/public/layout/header';
import { Outlet } from 'react-router-dom';

export default function Public() {
  return (
    <div className="public-theme">
      <header>
        <Header />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
