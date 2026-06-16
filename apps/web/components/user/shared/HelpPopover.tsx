import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { HelpPopoverProps } from './ui.types';

/**
 * Apresentação compartilhada do ícone "?" + modal de ajuda. Não conhece nenhum
 * dicionário: recebe título/parágrafos/exemplo prontos. É a base reutilizada por
 * MetricHelp (métricas) e HelpHint (conceitos de configuração), garantindo visual
 * e comportamento idênticos em todo o app.
 */
export default function HelpPopover({
  title,
  paragraphs,
  example,
  idBase,
  className = '',
}: HelpPopoverProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label={`O que é ${title}?`}
        title={`O que é ${title}?`}
        className={`inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-(--quaternary-color)/40 align-middle text-[10px] font-bold leading-none text-(--text-tertiary) transition-colors hover:border-(--primary-color)/50 hover:bg-(--seventh-color) hover:text-(--text-primary) ${className}`}
      >
        ?
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={idBase}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card font-work-sans"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2
                id={idBase}
                className="font-montserrat text-lg font-semibold text-(--text-primary)"
              >
                {title}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="btn-ghost font-poppins px-3 py-1 text-sm"
              >
                Fechar
              </button>
            </div>

            <div className="space-y-3">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-(--text-secondary)">
                  {paragraph}
                </p>
              ))}
            </div>

            {example && (
              <p className="mt-4 rounded-lg border border-(--quaternary-color)/10 bg-(--seventh-color) px-3 py-2 text-sm text-(--text-secondary)">
                <span className="font-semibold text-(--text-primary)">Exemplo: </span>
                {example}
              </p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
