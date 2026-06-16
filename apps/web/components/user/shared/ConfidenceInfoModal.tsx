import { useEffect } from 'react';
import type { ConfidenceTier } from 'lib/interfaces/domain/feedback.domain';
import type { ConfidenceInfoModalProps } from './ui.types';
import {
  CONFIDENCE_TIER_LABEL,
  CONFIDENCE_TIER_TONE,
  confidenceSampleSentence,
} from 'src/lib/utils/statistics';

/**
 * Faixas explicadas em linguagem simples (da pior para a melhor). A matemática
 * (margem de erro) vem da estatística amostral — aqui só traduzimos para o gestor.
 */
const TIER_ROWS: Array<{
  key: ConfidenceTier;
  range: string;
  margin: string;
  reading: string;
}> = [
  {
    key: 'insufficient',
    range: 'Menos de 10 respostas',
    margin: 'margem enorme',
    reading: 'Respostas demais de menos — ainda não dá pra concluir nada.',
  },
  {
    key: 'low',
    range: '10 a 29 respostas',
    margin: '± ~20%',
    reading: 'Dá pra perceber uma direção, mas com cautela — pode mudar com mais respostas.',
  },
  {
    key: 'moderate',
    range: '30 a 99 respostas',
    margin: '± ~10–18%',
    reading: 'Já dá pra confiar na tendência e agir com mais segurança.',
  },
  {
    key: 'good',
    range: '100 ou mais respostas',
    margin: '± ~10% ou menos',
    reading: 'Número sólido — bom para tomar decisão com confiança.',
  },
];

/**
 * Modal que explica, de forma simples e visual, o que significa o selo de confiança:
 * quanto mais respostas um resultado reúne, menor a margem de erro e mais ele reflete
 * a realidade. Destaca a faixa atual quando informada.
 */
export default function ConfidenceInfoModal({
  tier,
  n,
  unit = 'feedbacks',
  onClose,
}: ConfidenceInfoModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confidence-info-title"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card font-work-sans"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2
            id="confidence-info-title"
            className="font-montserrat text-lg font-semibold text-(--text-primary)"
          >
            Como funciona a confiança
          </h2>
          <button onClick={onClose} className="btn-ghost font-poppins px-3 py-1 text-sm">
            Fechar
          </button>
        </div>

        <p className="text-sm leading-relaxed text-(--text-secondary)">
          A confiança mostra o quanto você pode confiar neste número — e depende de{' '}
          <strong className="text-(--text-primary)">quantas respostas</strong> ele reúne.
          Quanto mais respostas, menor a “margem de erro” e mais o resultado reflete a
          realidade.
        </p>

        {typeof n === 'number' && (
          <p className="mt-3 rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color) px-3 py-2 text-sm text-(--text-secondary)">
            {confidenceSampleSentence(n, unit)}
          </p>
        )}

        <ul className="mt-4 space-y-2">
          {TIER_ROWS.map((row) => {
            const active = tier === row.key;
            return (
              <li
                key={row.key}
                className={`rounded-xl border bg-(--seventh-color)/60 p-3 ${CONFIDENCE_TIER_TONE[row.key]} ${
                  active ? 'ring-2 ring-(--primary-color)/50' : ''
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-current" />
                  <span className="text-sm font-semibold">{CONFIDENCE_TIER_LABEL[row.key]}</span>
                  <span className="text-xs opacity-80">· {row.range}</span>
                  <span className="ml-auto text-xs font-medium opacity-90">{row.margin}</span>
                  {active && (
                    <span className="rounded-full bg-(--primary-color)/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--primary-color)">
                      Atual
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-(--text-secondary)">
                  {row.reading}
                </p>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-(--text-tertiary)">
          Resumindo: <strong className="text-(--text-secondary)">mais feedbacks = mais
          confiança</strong>. Com poucos, trate os números como uma pista; com muitos, como
          base para decidir.
        </p>
      </div>
    </div>
  );
}
