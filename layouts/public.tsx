import Header from 'components/public/layout/header';
import { Outlet } from 'react-router-dom';

export default function Public() {
  return (
    <div className="public-theme min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="relative z-10">
        <Header />
      </header>
      <main className="relative z-0">
        <Outlet />
      </main>
    </div>
  );
}
