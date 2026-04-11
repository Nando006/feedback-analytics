import type { InsightsReportErrorStateProps } from './ui.types';

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default function InsightsReportErrorState({
  error,
  variant = 'error',
  onClose,
}: InsightsReportErrorStateProps) {
  const isWarning = variant === 'warning';

  const title = isWarning ? 'Atenção' : 'Erro ao atualizar insights';

  const accentColor = isWarning ? 'var(--neutral)' : 'var(--negative)';
  const iconBg = isWarning
    ? 'rgba(var(--neutral-rgb, 234 179 8) / 0.12)'
    : 'rgba(var(--negative-rgb, 239 68 68) / 0.12)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar aviso"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) shadow-2xl font-work-sans"
      >
        {/* Barra de cor superior */}
        <div
          className="h-1 w-full"
          style={{ background: accentColor }}
          aria-hidden="true"
        />

        <div className="flex flex-col items-center gap-4 px-8 py-8 text-center">
          {/* Ícone */}
          <div
            className="flex items-center justify-center rounded-full p-3"
            style={{ background: iconBg, color: accentColor }}
          >
            {isWarning ? <WarningIcon /> : <ErrorIcon />}
          </div>

          {/* Título */}
          <h3
            className="text-xl font-semibold font-montserrat"
            style={{ color: accentColor }}
          >
            {title}
          </h3>

          {/* Mensagem */}
          <p className="text-sm leading-relaxed text-(--text-secondary) max-w-xs">
            {error}
          </p>

          {/* Divisor */}
          <div className="w-full border-t border-(--quaternary-color)/10 pt-2" />

          {/* Ação */}
          <button
            type="button"
            onClick={onClose}
            className="btn-primary font-poppins px-8 py-2.5 text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
