import type { LoaderFeedbacksAnalyticsAll } from 'src/routes/loaders/loaderFeedbacksAnalyticsAll';

type Summary = Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsAll>>['summary'];

interface PropsAnalyticsAllSummarySection {
  summary: NonNullable<Summary>;
}

export default function AnalyticsAllSummarySection({
  summary,
}: PropsAnalyticsAllSummarySection) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        Visão geral dos feedbacks analisados pela IA
      </h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Resumo automático gerado a partir dos feedbacks e da categorização de
        sentimentos.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Total analisados
          </div>
          <div className="text-2xl font-semibold text-[var(--text-primary)]">
            {summary.totalAnalyzed}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Sentimentos
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300">
              Positivos: {summary.sentiments.positive}
            </span>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-amber-300">
              Neutros: {summary.sentiments.neutral}
            </span>
            <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-rose-300">
              Negativos: {summary.sentiments.negative}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Principais categorias
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {summary.topCategories.slice(0, 3).map((cat) => (
              <span
                key={cat.name}
                className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-[var(--text-secondary)]">
                {cat.name} ({cat.count})
              </span>
            ))}
            {summary.topCategories.length === 0 && (
              <span className="text-[var(--text-muted)]">
                Nenhuma categoria identificada.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
