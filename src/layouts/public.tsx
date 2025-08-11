import Header from 'components/public/header/header';
import { Outlet } from 'react-router-dom';

export default function Public() {
  return (
    <div className="background-color color">
      <header>
        <Header />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
