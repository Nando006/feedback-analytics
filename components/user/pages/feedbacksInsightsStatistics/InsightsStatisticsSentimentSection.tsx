import type { InsightsStatisticsSentimentSectionProps } from './ui.types';

export default function InsightsStatisticsSentimentSection({
  summary,
  positivePct,
  neutralPct,
  negativePct,
}: InsightsStatisticsSentimentSectionProps) {
  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)] font-montserrat">
        Distribuição de sentimentos nos feedbacks
      </h2>
      <p className="mb-4 text-sm text-[var(--text-tertiary)]">
        Visão estatística da percepção geral dos clientes com base nos feedbacks
        analisados pela IA.
      </p>

      <div className="space-y-4">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-(--seventh-color)">
          <div style={{ width: `${positivePct}%` }} className="h-full bg-(--positive)/70" />
          <div style={{ width: `${neutralPct}%` }} className="h-full bg-(--neutral)/70" />
          <div style={{ width: `${negativePct}%` }} className="h-full bg-(--negative)/70" />
        </div>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              Positivos
            </div>
            <div className="text-xl font-semibold text-(--positive)">
              {summary.sentiments.positive} ({positivePct}%)
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              Neutros
            </div>
            <div className="text-xl font-semibold text-(--neutral)">
              {summary.sentiments.neutral} ({neutralPct}%)
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              Negativos
            </div>
            <div className="text-xl font-semibold text-(--negative)">
              {summary.sentiments.negative} ({negativePct}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
