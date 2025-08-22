import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 md:p-8 glass-card">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative">
          <div className="avatar-ring">
            <div className="avatar-placeholder">U</div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            Seu Nome
          </h1>
          <p className="mt-1 truncate text-sm text-[var(--text-muted)] md:text-base">
            Descrição
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge">Pro</span>
            <span className="badge">Equipe A</span>
            <span className="badge">Desde 2025</span>
          </div>
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
