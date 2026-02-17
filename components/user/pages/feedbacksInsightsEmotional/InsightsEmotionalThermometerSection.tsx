import type { LoaderFeedbacksInsightsEmotional } from 'src/routes/loaders/loaderFeedbacksInsightsEmotional';

type Summary = Awaited<
  ReturnType<typeof LoaderFeedbacksInsightsEmotional>
>['summary'];

interface PropsInsightsEmotionalThermometerSection {
  summary: NonNullable<Summary>;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
}

export default function InsightsEmotionalThermometerSection({
  summary,
  positivePct,
  neutralPct,
  negativePct,
}: PropsInsightsEmotionalThermometerSection) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card space-y-4">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Termômetro emocional dos clientes
      </h2>
      <p className="max-w-2xl text-sm text-[var(--text-muted)]">
        Visualização da intensidade emocional dos feedbacks, destacando onde os
        clientes estão mais satisfeitos e onde sentem maior frustração.
      </p>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-neutral-800">
        <div style={{ width: `${positivePct}%` }} className="h-full bg-emerald-500/70" />
        <div style={{ width: `${neutralPct}%` }} className="h-full bg-amber-500/70" />
        <div style={{ width: `${negativePct}%` }} className="h-full bg-rose-500/70" />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Positivos
          </div>
          <div className="text-xl font-semibold text-emerald-300">
            {summary.sentiments.positive} ({positivePct}%)
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Neutros
          </div>
          <div className="text-xl font-semibold text-amber-300">
            {summary.sentiments.neutral} ({neutralPct}%)
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
            Negativos
          </div>
          <div className="text-xl font-semibold text-rose-300">
            {summary.sentiments.negative} ({negativePct}%)
          </div>
        </div>
      </div>
    </div>
  );
}
