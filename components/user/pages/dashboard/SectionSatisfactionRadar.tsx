import { FaFrown, FaMeh, FaSmile } from 'react-icons/fa';
import FormatToCurrencyReal from 'lib/utils/FormatToReal';
import type { SectionSatisfactionRadarProps } from './ui.types';

export default function SectionSatisfactionRadar({
  positive,
  neutral,
  negative,
}: SectionSatisfactionRadarProps) {
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
        <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          <div className="flex items-center gap-2">
            <FaSmile />
            Positivos
          </div>
          <span className="font-semibold text-green-100">
            {FormatToCurrencyReal(positive)}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          <div className="flex items-center gap-2">
            <FaMeh />
            Neutros
          </div>
          <span className="font-semibold text-yellow-100">
            {FormatToCurrencyReal(neutral)}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <div className="flex items-center gap-2">
            <FaFrown />
            Negativos
          </div>
          <span className="font-semibold text-red-100">
            {FormatToCurrencyReal(negative)}
          </span>
        </div>
      </div>
    </section>
  );
}
