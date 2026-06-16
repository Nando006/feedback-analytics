import { FaFrown, FaMeh, FaSmile } from 'react-icons/fa';
import FormatToCurrencyReal from 'src/lib/utils/FormatToReal';
import ConfidenceBadge from 'components/user/shared/ConfidenceBadge';
import { formatNss, formatInterval, shouldShowNss } from 'src/lib/utils/statistics';
import type { SectionSatisfactionRadarProps } from './ui.types';

export default function SectionSatisfactionRadar({
  positive,
  neutral,
  negative,
  stats,
}: SectionSatisfactionRadarProps) {
  const sentimentRows = [
    {
      key: 'positive',
      label: 'Notas 4–5',
      value: positive,
      Icon: FaSmile,
      iconClassName: 'bg-(--positive)/12 text-(--positive)',
      valueClassName: 'text-(--positive)',
      borderClassName: 'border-(--positive)/22',
    },
    {
      key: 'neutral',
      label: 'Nota 3',
      value: neutral,
      Icon: FaMeh,
      iconClassName: 'bg-(--neutral)/12 text-(--neutral)',
      valueClassName: 'text-(--neutral)',
      borderClassName: 'border-(--neutral)/22',
    },
    {
      key: 'negative',
      label: 'Notas 1–2',
      value: negative,
      Icon: FaFrown,
      iconClassName: 'bg-(--negative)/12 text-(--negative)',
      valueClassName: 'text-(--negative)',
      borderClassName: 'border-(--negative)/22',
    },
  ] as const;

  const ai = stats?.aiSentiment;
  const showAiNss = ai != null && shouldShowNss(ai.confidenceTier);

  return (
    <section className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">Satisfação e sentimento</h2>
          <p className="text-sm text-(--text-tertiary)">
            Satisfação pelas notas e sentimento (IA) do texto
          </p>
        </div>
        <ConfidenceBadge tier={stats?.confidenceTier} n={stats?.totalFeedbacks} />
      </header>

      {stats && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {typeof stats.starMean === 'number' && (
            <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color) px-3 py-2.5">
              <p className="text-xs text-(--text-tertiary)">Média (estrelas)</p>
              <p className="text-lg font-semibold text-(--text-primary)">
                {stats.starMean.toFixed(1)}
              </p>
              {stats.starMeanCI && (
                <p
                  className="text-[10px] text-(--text-tertiary)"
                  title="Estimativa: o valor real provavelmente está nessa faixa (intervalo de confiança 95%)."
                >
                  faixa provável {formatInterval(stats.starMeanCI, 1)}
                </p>
              )}
            </div>
          )}
          {typeof stats.netSatisfaction === 'number' && (
            <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color) px-3 py-2.5">
              <p
                className="text-xs text-(--text-tertiary)"
                title="% de notas boas (4 e 5) menos % de notas ruins (1 e 2). Varia de -100 a +100."
              >
                Saldo de satisfação
              </p>
              <p className="text-lg font-semibold text-(--text-primary)">
                {formatNss(stats.netSatisfaction)}
              </p>
            </div>
          )}
          {stats.csat && (
            <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color) px-3 py-2.5">
              <p
                className="text-xs text-(--text-tertiary)"
                title="Quantos clientes deram nota 4 ou 5 (% de avaliações satisfeitas)."
              >
                Clientes satisfeitos
              </p>
              <p className="text-lg font-semibold text-(--text-primary)">
                {stats.csat.pct.toFixed(0)}%
              </p>
            </div>
          )}
          {showAiNss && (
            <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--seventh-color) px-3 py-2.5">
              <p
                className="text-xs text-(--text-tertiary)"
                title="Comentários positivos menos negativos (lidos pela IA). Varia de -100 a +100."
              >
                Saldo de sentimento (IA)
              </p>
              <p className="text-lg font-semibold text-(--text-primary)">
                {formatNss(ai!.netSentimentScore)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {sentimentRows.map((row) => (
          <div
            key={row.key}
            className={`flex items-center justify-between rounded-xl border bg-(--seventh-color) px-4 py-3 text-sm ${row.borderClassName}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${row.iconClassName}`}>
                <row.Icon className="text-sm" />
              </div>
              <div>
                <p className="font-medium text-(--text-primary)">{row.label}</p>
                <p className="text-xs text-(--text-tertiary)">Avaliações por nota</p>
              </div>
            </div>
            <span className={`text-lg font-semibold ${row.valueClassName}`}>
              {FormatToCurrencyReal(row.value)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
