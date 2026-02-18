import type { AnalyticsPositiveSummarySectionProps } from './ui.types';

export default function AnalyticsPositiveSummarySection({
  summary,
}: AnalyticsPositiveSummarySectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        Forças e destaques percebidos pelos clientes
      </h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Feedbacks com sentimento positivo ajudam a entender o que está funcionando
        bem na experiência do cliente.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Total positivos
          </div>
          <div className="text-2xl font-semibold text-emerald-300">
            {summary.sentiments.positive}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Principais temas elogiados
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {summary.topCategories.slice(0, 5).map((cat) => (
              <span
                key={cat.name}
                className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-200">
                {cat.name} ({cat.count})
              </span>
            ))}
            {summary.topCategories.length === 0 && (
              <span className="text-[var(--text-muted)]">
                Nenhum tema recorrente identificado ainda.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
