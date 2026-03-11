import type { AnalyticsAllSummarySectionProps } from './ui.types';

export default function AnalyticsAllSummarySection({
  summary,
}: AnalyticsAllSummarySectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        Visão geral dos feedbacks analisados pela IA
      </h2>
      <p className="mb-4 text-sm text-[var(--text-tertiary)]">
        Resumo automático gerado a partir dos feedbacks e da categorização de
        sentimentos.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Total analisados
          </div>
          <div className="text-2xl font-semibold text-[var(--text-primary)]">
            {summary.totalAnalyzed}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
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
          <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Principais categorias
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {summary.topCategories.slice(0, 3).map((cat) => (
              <span
                key={cat.name}
                className="rounded-full border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-1 text-(--text-secondary)">
                {cat.name} ({cat.count})
              </span>
            ))}
            {summary.topCategories.length === 0 && (
              <span className="text-[var(--text-tertiary)]">
                Nenhuma categoria identificada.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
