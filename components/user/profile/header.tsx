import { Link } from 'react-router-dom';
import Avatar from '../shared/avatar';
import type { PropsEnterpriseAndUser } from 'lib/interfaces/entities/enterpriseAndUser';

export default function Header({ enterprise, user }: PropsEnterpriseAndUser) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 md:p-8 glass-card">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <Avatar />

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            {enterprise.full_name ?? user.email ?? '-'}
          </h1>
        </div>

        <div className="flex gap-3">
          <Link
            to="/user/edit/profile"
            className="btn-primary">
            Editar perfil
          </Link>
          <button
            type="button"
            className="btn-ghost">
            Compartilhar
          </button>
        </div>
      </div>

      <div className="gradient-banner" />
    </section>
  );
}
