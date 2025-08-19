import { Link } from 'react-router-dom';

export default function Profile() {
  return (
    <div className="font-inter space-y-6">
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
              @username · Product Designer
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

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-[var(--shadow-secondary)] transition-shadow hover:shadow-[var(--shadow-primary)]">
          <div className="flex items-center gap-3">
            <div className="icon-bubble">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4">
                <path d="M7 8h10M7 12h6m-6 4h10" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Feedbacks</p>
              <p className="text-xl font-semibold">—</p>
            </div>
          </div>
        </div>
        <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-[var(--shadow-secondary)] transition-shadow hover:shadow-[var(--shadow-primary)]">
          <div className="flex items-center gap-3">
            <div className="icon-bubble">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4">
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Positivos</p>
              <p className="text-xl font-semibold">—</p>
            </div>
          </div>
        </div>
        <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-[var(--shadow-secondary)] transition-shadow hover:shadow-[var(--shadow-primary)]">
          <div className="flex items-center gap-3">
            <div className="icon-bubble">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4">
                <path d="M15 12l-2-2-4 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Negativos</p>
              <p className="text-xl font-semibold">—</p>
            </div>
          </div>
        </div>
        <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 shadow-[var(--shadow-secondary)] transition-shadow hover:shadow-[var(--shadow-primary)]">
          <div className="flex items-center gap-3">
            <div className="icon-bubble">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4">
                <path d="M12 6v12m6-6H6" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">NPS</p>
              <p className="text-xl font-semibold">—</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sobre</h2>
              <span className="text-xs text-[var(--text-muted)]">público</span>
            </div>
            <p className="max-w-2xl text-[var(--text-secondary)]">
              Conte aqui um breve resumo sobre você, sua função e o que te
              inspira. Este espaço é ideal para apresentar sua personalidade e
              objetivos.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Informações de contato
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <p className="text-xs text-[var(--text-muted)]">Email</p>
                <p className="mt-1 font-medium">—</p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <p className="text-xs text-[var(--text-muted)]">Telefone</p>
                <p className="mt-1 font-medium">—</p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <p className="text-xs text-[var(--text-muted)]">Localização</p>
                <p className="mt-1 font-medium">—</p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <p className="text-xs text-[var(--text-muted)]">Website</p>
                <p className="mt-1 font-medium">—</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold">Times e projetos</h2>
            <div className="flex flex-wrap gap-2">
              <span className="badge">Pesquisa UX</span>
              <span className="badge">Growth</span>
              <span className="badge">Mobile App</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold">Atividade recente</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="timeline-dot" />
                <div className="w-full space-y-2">
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="timeline-dot" />
                <div className="w-full space-y-2">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="timeline-dot" />
                <div className="w-full space-y-2">
                  <div className="skeleton h-4 w-2/5" />
                  <div className="skeleton h-3 w-3/5" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="mb-2 text-lg font-semibold">Links rápidos</h2>
            <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <Link
                className="hover:underline"
                to="/user/feedbacks/all">
                Meus feedbacks
              </Link>
              <Link
                className="hover:underline"
                to="/user/insights/statistics">
                Estatísticas
              </Link>
              <Link
                className="hover:underline"
                to="/user/qrcode/enterprise">
                QRCodes da empresa
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
