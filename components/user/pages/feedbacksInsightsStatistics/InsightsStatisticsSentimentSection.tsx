import type { InsightsStatisticsSentimentSectionProps } from './ui.types';

export default function InsightsStatisticsSentimentSection({
  summary,
  positivePct,
  neutralPct,
  negativePct,
}: InsightsStatisticsSentimentSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
        Distribuição de sentimentos nos feedbacks
      </h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        Visão estatística da percepção geral dos clientes com base nos feedbacks
        analisados pela IA.
      </p>

      <div className="space-y-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-800">
          <div style={{ width: `${positivePct}%` }} className="h-full bg-emerald-500/70" />
          <div style={{ width: `${neutralPct}%` }} className="h-full bg-amber-500/70" />
          <div style={{ width: `${negativePct}%` }} className="h-full bg-rose-500/70" />
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
              Positivos
            </div>
            <div className="text-xl font-semibold text-emerald-300">
              {summary.sentiments.positive} ({positivePct}%)
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
              Neutros
            </div>
            <div className="text-xl font-semibold text-amber-300">
              {summary.sentiments.neutral} ({neutralPct}%)
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
              Negativos
            </div>
            <div className="text-xl font-semibold text-rose-300">
              {summary.sentiments.negative} ({negativePct}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
