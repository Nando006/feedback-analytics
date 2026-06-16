import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

/**
 * Placeholder de carregamento da aba "Perguntas" — espelha os cards de pergunta
 * (título + nota + faixa + barra de distribuição) enquanto as métricas chegam.
 */
export default function InsightsQuestionsSkeleton() {
  return (
    <div aria-label="Métricas por pergunta carregando" className="font-work-sans space-y-4">
      {[0, 1, 2].map((i) => (
        <section
          key={i}
          className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <SkeletonBlock className="h-5 w-2/3" />
            <SkeletonBlock className="h-5 w-28" />
          </div>
          <div className="mt-4 flex items-center gap-6">
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
          <SkeletonBlock className="mt-4 h-2 w-full" />
        </section>
      ))}
    </div>
  );
}
