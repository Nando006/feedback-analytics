import type { MoodTone, InsightsReportMoodSectionProps } from './ui.types';
import ConfidenceBadge from 'components/user/shared/ConfidenceBadge';
import MetricHelp from 'components/user/shared/MetricHelp';
import { formatNss } from 'src/lib/utils/statistics';

const toneColors: Record<MoodTone, { border: string; bg: string; text: string }> = {
  positive: {
    border: 'border-(--positive)/60',
    bg: 'bg-(--positive)/10',
    text: 'text-(--positive)',
  },
  neutral: {
    border: 'border-(--neutral)/60',
    bg: 'bg-(--neutral)/10',
    text: 'text-(--neutral)',
  },
  negative: {
    border: 'border-(--negative)/60',
    bg: 'bg-(--negative)/10',
    text: 'text-(--negative)',
  },
};

export default function InsightsReportMoodSection({
  mood,
  summary,
  positivePct,
  neutralPct,
  negativePct,
  nss,
  confidenceTier,
  showNss,
}: InsightsReportMoodSectionProps) {
  const tone = toneColors[mood.tone];

  return (
    <div
      className={`font-work-sans flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${tone.border} ${tone.bg}`}>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs uppercase tracking-wide ${tone.text}`}>
            Clima emocional geral
            <MetricHelp term="climate" />
          </span>
          <ConfidenceBadge tier={confidenceTier} n={summary?.totalAnalyzed} unit="analyzed" />
        </div>
        <div className={`flex items-baseline gap-2 text-xl font-semibold ${tone.text}`}>
          <span>{mood.label}</span>
          {showNss && typeof nss === 'number' && (
            <span className="inline-flex items-center gap-1 text-sm font-medium opacity-80">
              Saldo de sentimento {formatNss(nss)}
              <MetricHelp term="netSentiment" />
            </span>
          )}
        </div>
        <p className="max-w-xl text-xs text-(--text-tertiary)">{mood.description}</p>
      </div>
      {summary && summary.totalAnalyzed > 0 && (
        <div className="w-full space-y-2 md:w-1/2">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-(--seventh-color)">
            <div style={{ width: `${positivePct}%` }} className="h-full bg-(--positive)/70" />
            <div style={{ width: `${neutralPct}%` }} className="h-full bg-(--neutral)/70" />
            <div style={{ width: `${negativePct}%` }} className="h-full bg-(--negative)/70" />
          </div>
          <div className="flex justify-between text-[10px] text-(--text-tertiary)">
            <span>Positivos: {positivePct}%</span>
            <span>Neutros: {neutralPct}%</span>
            <span>Negativos: {negativePct}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
