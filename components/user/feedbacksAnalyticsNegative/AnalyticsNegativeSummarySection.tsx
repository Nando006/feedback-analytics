import type { LoaderFeedbacksAnalyticsNegative } from 'src/routes/loaders/loaderFeedbacksAnalyticsNegative';

type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksAnalyticsNegative>
>['summary'];

interface PropsAnalyticsNegativeSummarySection {
  summary: NonNullable<Summary>;
}

export default function AnalyticsNegativeSummarySection({
  summary,
}: PropsAnalyticsNegativeSummarySection) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        Pontos de atenção e oportunidades de melhoria
      </h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Feedbacks com sentimento negativo ajudam a identificar gargalos na jornada
        do cliente e oportunidades claras de ação.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Total negativos
          </div>
          <div className="text-2xl font-semibold text-rose-300">
            {summary.sentiments.negative}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Principais problemas apontados
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {summary.topCategories.slice(0, 5).map((cat) => (
              <span
                key={cat.name}
                className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-rose-200">
                {cat.name} ({cat.count})
              </span>
            ))}
            {summary.topCategories.length === 0 && (
              <span className="text-[var(--text-muted)]">
                Nenhum problema recorrente identificado ainda.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
