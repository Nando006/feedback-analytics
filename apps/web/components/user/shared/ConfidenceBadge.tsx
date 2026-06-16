import { useState } from 'react';
import type { ConfidenceBadgeProps } from './ui.types';
import {
  CONFIDENCE_TIER_LABEL,
  CONFIDENCE_TIER_TONE,
  confidenceCountSuffix,
} from 'src/lib/utils/statistics';
import ConfidenceInfoModal from './ConfidenceInfoModal';

/**
 * Selo da confiabilidade da amostra (insuficiente/baixa/moderada/boa), derivado
 * do n. Comunica honestamente quando os números são apenas direcionais. Clicável:
 * abre um modal que explica, em linguagem simples, como a confiança funciona.
 * `unit` deixa explícito o que o n conta (feedbacks / respostas / analisados pela IA).
 */
export default function ConfidenceBadge({
  tier,
  n,
  unit = 'feedbacks',
  className = '',
}: ConfidenceBadgeProps) {
  const [open, setOpen] = useState(false);

  if (!tier) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title="Clique para entender como a confiança funciona"
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-80 ${CONFIDENCE_TIER_TONE[tier]} ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {CONFIDENCE_TIER_LABEL[tier]}
        {typeof n === 'number' ? ` · ${confidenceCountSuffix(n, unit)}` : ''}
        <svg className="h-3 w-3 opacity-70" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" />
          <path d="M8 7.2v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="5.2" r="0.7" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <ConfidenceInfoModal tier={tier} n={n} unit={unit} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
