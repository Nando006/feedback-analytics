import type { ConfidenceBadgeProps } from './ui.types';
import {
  CONFIDENCE_TIER_LABEL,
  CONFIDENCE_TIER_TONE,
} from 'src/lib/utils/statistics';

/**
 * Selo da confiabilidade da amostra (insuficiente/baixa/moderada/boa), derivado
 * do n. Comunica honestamente quando os números são apenas direcionais.
 */
export default function ConfidenceBadge({ tier, n, className = '' }: ConfidenceBadgeProps) {
  if (!tier) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${CONFIDENCE_TIER_TONE[tier]} ${className}`}
      title={
        typeof n === 'number'
          ? `Confiabilidade do resultado, baseada em ${n} feedback(s) analisado(s)`
          : 'Confiabilidade do resultado'
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {CONFIDENCE_TIER_LABEL[tier]}
      {typeof n === 'number' ? ` · ${n} feedback${n === 1 ? '' : 's'}` : ''}
    </span>
  );
}
