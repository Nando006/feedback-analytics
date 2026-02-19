import type { InsightsReportHeaderSectionProps } from './ui.types';

export default function InsightsReportHeaderSection({
  updatedLabel,
  refreshing,
  onRefresh,
}: InsightsReportHeaderSectionProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
          Relatório de Insights da IA
        </h2>
        <p className="max-w-2xl text-sm text-[var(--text-muted)]">
          Resumo estratégico gerado automaticamente a partir dos feedbacks,
          sentimentos e categorias identificadas pela IA, com foco em
          oportunidades de melhoria e pontos fortes da experiência do cliente.
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {updatedLabel && (
          <span className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
            Última atualização: {updatedLabel}
          </span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-neutral-800 disabled:opacity-60">
          {refreshing ? 'Atualizando...' : 'Atualizar insights com IA'}
        </button>
      </div>
    </div>
  );
}
