import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

/**
 * Placeholder das seções de dados do dashboard (métricas + gráficos + perguntas)
 * exibido ao TROCAR de escopo, enquanto stats/questions recarregam. Não cobre o
 * cabeçalho nem o "Relatório de Insights" (que tem seu próprio estado de loading).
 */
export default function DashboardScopedSkeleton() {
  return (
    <div aria-label="Carregando métricas do escopo" className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5"
          >
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-3 h-8 w-20" />
            <SkeletonBlock className="mt-3 h-3 w-32" />
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <section
            key={i}
            className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6"
          >
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="mt-6 h-40 w-full" />
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-5 w-44" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
