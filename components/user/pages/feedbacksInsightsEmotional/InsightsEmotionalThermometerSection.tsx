import type { InsightsEmotionalThermometerSectionProps } from './ui.types';

export default function InsightsEmotionalThermometerSection({
  summary,
  positivePct,
  neutralPct,
  negativePct,
}: InsightsEmotionalThermometerSectionProps) {
  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card space-y-4">
      <h2 className="text-lg font-montserrat font-semibold text-[var(--text-primary)]">
        Termômetro emocional dos clientes
      </h2>
      <p className="max-w-2xl text-sm text-[var(--text-tertiary)]">
        Visualização da intensidade emocional dos feedbacks, destacando onde os
        clientes estão mais satisfeitos e onde sentem maior frustração.
      </p>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-(--seventh-color)">
        <div style={{ width: `${positivePct}%` }} className="h-full bg-(--positive)/70" />
        <div style={{ width: `${neutralPct}%` }} className="h-full bg-(--neutral)/70" />
        <div style={{ width: `${negativePct}%` }} className="h-full bg-(--negative)/70" />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Positivos
          </div>
          <div className="text-xl font-semibold text-(--positive)">
            {summary.sentiments.positive} ({positivePct}%)
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Neutros
          </div>
          <div className="text-xl font-semibold text-(--neutral)">
            {summary.sentiments.neutral} ({neutralPct}%)
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Negativos
          </div>
          <div className="text-xl font-semibold text-(--negative)">
            {summary.sentiments.negative} ({negativePct}%)
          </div>
        </div>
      </div>
    </div>
  );
}
