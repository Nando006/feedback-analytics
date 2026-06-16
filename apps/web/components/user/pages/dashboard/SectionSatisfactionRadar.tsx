import ConfidenceBadge from 'components/user/shared/ConfidenceBadge';
import MetricHelp from 'components/user/shared/MetricHelp';
import { formatNss, shouldShowNss } from 'src/lib/utils/statistics';
import type { SectionSatisfactionRadarProps } from './ui.types';

/**
 * Indicadores que NÃO estão nos cards do topo nem na distribuição: Saldo de
 * satisfação, Clientes satisfeitos e Saldo de sentimento (IA), com o selo de
 * confiança. (Média e quebra por nota ficam nos cards do topo / distribuição.)
 */
export default function SectionSatisfactionRadar({ stats }: SectionSatisfactionRadarProps) {
  const ai = stats?.aiSentiment;
  const showAiNss = ai != null && shouldShowNss(ai.confidenceTier);

  return (
    <section className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">Satisfação e sentimento</h2>
          <p className="text-sm text-(--text-tertiary)">
            Indicadores de satisfação (notas) e sentimento (IA) do texto
          </p>
        </div>
        <ConfidenceBadge tier={stats?.confidenceTier} n={stats?.totalFeedbacks} />
      </header>

      {stats ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {typeof stats.netSatisfaction === 'number' && (
            <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color) px-3 py-2.5">
              <p className="flex items-center gap-1 text-xs text-(--text-tertiary)">
                Saldo de satisfação
                <MetricHelp term="netSatisfaction" />
              </p>
              <p className="text-lg font-semibold text-(--text-primary)">
                {formatNss(stats.netSatisfaction)}
              </p>
            </div>
          )}
          {stats.csat && (
            <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color) px-3 py-2.5">
              <p className="flex items-center gap-1 text-xs text-(--text-tertiary)">
                Clientes satisfeitos
                <MetricHelp term="csat" />
              </p>
              <p className="text-lg font-semibold text-(--text-primary)">
                {stats.csat.pct.toFixed(0)}%
              </p>
            </div>
          )}
          {showAiNss && (
            <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color) px-3 py-2.5">
              <p className="flex items-center gap-1 text-xs text-(--text-tertiary)">
                Saldo de sentimento (IA)
                <MetricHelp term="netSentiment" />
              </p>
              <p className="text-lg font-semibold text-(--text-primary)">
                {formatNss(ai!.netSentimentScore)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-(--text-tertiary)">
          Sem dados para o escopo selecionado.
        </p>
      )}
    </section>
  );
}
