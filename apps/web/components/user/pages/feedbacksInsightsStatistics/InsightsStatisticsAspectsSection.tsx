import type { InsightsStatisticsAspectsSectionProps } from './ui.types';
import { formatNss } from 'src/lib/utils/statistics';

function toneClass(nss: number): string {
  if (nss > 5) return 'text-(--positive)';
  if (nss < -5) return 'text-(--negative)';
  return 'text-(--neutral)';
}

/**
 * Aspectos citados no texto, ordenados por impacto (quantidade × intensidade).
 * Os de saldo negativo são as "principais dores".
 */
export default function InsightsStatisticsAspectsSection({
  aspects,
}: InsightsStatisticsAspectsSectionProps) {
  if (!aspects || aspects.length === 0) return null;

  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)] font-montserrat">
        Assuntos que mais impactam
      </h3>
      <p className="mb-4 text-xs text-[var(--text-tertiary)]">
        Assuntos citados nos comentários, ordenados por impacto (quantidade × intensidade).
        Saldo negativo = principais reclamações.
      </p>

      <ul className="space-y-2">
        {aspects.map((a) => (
          <li
            key={a.aspect}
            className="flex items-center justify-between gap-3 rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color) px-3 py-2"
          >
            <div className="min-w-0">
              <span className="block truncate text-sm text-(--text-primary)">{a.aspect}</span>
              <span className="text-[11px] text-(--text-tertiary)">
                {a.count} menções · {a.positive} positivas / {a.neutral} neutras / {a.negative} negativas
              </span>
            </div>
            <span
              className={`shrink-0 text-sm font-semibold ${toneClass(a.netSentimentScore)}`}
              title="Comentários positivos menos negativos sobre este assunto (-100 a +100)."
            >
              Saldo {formatNss(a.netSentimentScore)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
