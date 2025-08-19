import { Link } from 'react-router-dom';

export default function Content() {
  return (
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
          <h2 className="mb-4 text-lg font-semibold">Informações de contato</h2>
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
          <h2 className="mb-4 text-lg font-semibold">Últimas atividades</h2>
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
  );
}
