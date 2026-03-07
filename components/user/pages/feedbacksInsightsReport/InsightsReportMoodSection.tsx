import type { MoodTone, InsightsReportMoodSectionProps } from './ui.types';

const toneColors: Record<MoodTone, { border: string; bg: string; text: string }> = {
  positive: {
    border: 'border-emerald-500/60',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
  },
  neutral: {
    border: 'border-amber-500/60',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
  },
  negative: {
    border: 'border-rose-500/60',
    bg: 'bg-rose-500/10',
    text: 'text-rose-300',
  },
};

export default function InsightsReportMoodSection({
  mood,
  summary,
  positivePct,
  neutralPct,
  negativePct,
}: InsightsReportMoodSectionProps) {
  const tone = toneColors[mood.tone];

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${tone.border} ${tone.bg}`}>
      <div className="space-y-1">
        <div className={`text-xs uppercase tracking-wide ${tone.text}`}>
          Clima emocional geral
        </div>
        <div className={`text-xl font-semibold ${tone.text}`}>{mood.label}</div>
        <p className="max-w-xl text-xs text-[var(--text-tertiary)]">{mood.description}</p>
      </div>
      {summary && summary.totalAnalyzed > 0 && (
        <div className="w-full space-y-2 md:w-1/2">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-900">
            <div style={{ width: `${positivePct}%` }} className="h-full bg-emerald-500/70" />
            <div style={{ width: `${neutralPct}%` }} className="h-full bg-amber-500/70" />
            <div style={{ width: `${negativePct}%` }} className="h-full bg-rose-500/70" />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
            <span>Positivos: {positivePct}%</span>
            <span>Neutros: {neutralPct}%</span>
            <span>Negativos: {negativePct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
