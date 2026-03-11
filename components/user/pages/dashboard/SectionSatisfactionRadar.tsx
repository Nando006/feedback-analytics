import { FaFrown, FaMeh, FaSmile } from 'react-icons/fa';
import FormatToCurrencyReal from 'lib/utils/FormatToReal';
import type { SectionSatisfactionRadarProps } from './ui.types';

export default function SectionSatisfactionRadar({
  positive,
  neutral,
  negative,
}: SectionSatisfactionRadarProps) {
  const sentimentRows = [
    {
      key: 'positive',
      label: 'Positivos',
      value: positive,
      Icon: FaSmile,
      iconClassName: 'bg-(--positive)/12 text-(--positive)',
      valueClassName: 'text-(--positive)',
      borderClassName: 'border-(--positive)/22',
    },
    {
      key: 'neutral',
      label: 'Neutros',
      value: neutral,
      Icon: FaMeh,
      iconClassName: 'bg-(--neutral)/12 text-(--neutral)',
      valueClassName: 'text-(--neutral)',
      borderClassName: 'border-(--neutral)/22',
    },
    {
      key: 'negative',
      label: 'Negativos',
      value: negative,
      Icon: FaFrown,
      iconClassName: 'bg-(--negative)/12 text-(--negative)',
      valueClassName: 'text-(--negative)',
      borderClassName: 'border-(--negative)/22',
    },
  ] as const;

  return (
    <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-(--text-primary)">Radar de satisfação</h2>
          <p className="text-sm text-(--text-tertiary)">
            Panorama resumido dos sentimentos capturados
          </p>
        </div>
      </header>

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
                <div className="font-medium text-(--text-primary)">{row.label}</div>
                <div className="text-xs text-(--text-tertiary)">Sentimentos mapeados no período</div>
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
