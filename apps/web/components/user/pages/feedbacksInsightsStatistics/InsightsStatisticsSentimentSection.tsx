import type { InsightsStatisticsSentimentSectionProps } from './ui.types';
import ConfidenceBadge from 'components/user/shared/ConfidenceBadge';
import MetricHelp from 'components/user/shared/MetricHelp';
import {
  formatNss,
  formatFractionIntervalPct,
  shouldShowNss,
} from 'src/lib/utils/statistics';

export default function InsightsStatisticsSentimentSection({
  summary,
  positivePct,
  neutralPct,
  negativePct,
}: InsightsStatisticsSentimentSectionProps) {
  const cis = summary.sentimentCIs;
  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold text-[var(--text-primary)] font-montserrat">
          Distribuição de sentimentos nos feedbacks
          <MetricHelp term="sentimentDistribution" />
        </h2>
        <div className="flex items-center gap-2">
          {shouldShowNss(summary.confidenceTier) && typeof summary.netSentimentScore === 'number' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-(--seventh-color) px-2.5 py-1 text-xs font-semibold text-(--text-secondary)">
              Saldo de sentimento {formatNss(summary.netSentimentScore)}
              <MetricHelp term="netSentiment" />
            </span>
          )}
          <ConfidenceBadge tier={summary.confidenceTier} n={summary.totalAnalyzed} unit="analyzed" />
        </div>
      </div>
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
            {cis && (
              <div className="text-[10px] text-(--text-tertiary)">
                faixa provável {formatFractionIntervalPct(cis.positive)}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              Neutros
            </div>
            <div className="text-xl font-semibold text-(--neutral)">
              {summary.sentiments.neutral} ({neutralPct}%)
            </div>
            {cis && (
              <div className="text-[10px] text-(--text-tertiary)">
                faixa provável {formatFractionIntervalPct(cis.neutral)}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              Negativos
            </div>
            <div className="text-xl font-semibold text-(--negative)">
              {summary.sentiments.negative} ({negativePct}%)
            </div>
            {cis && (
              <div className="text-[10px] text-(--text-tertiary)">
                faixa provável {formatFractionIntervalPct(cis.negative)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
