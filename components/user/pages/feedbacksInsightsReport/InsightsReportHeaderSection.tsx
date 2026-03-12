import type { InsightsReportHeaderSectionProps } from './ui.types';

export default function InsightsReportHeaderSection({
  updatedLabel,
  refreshing,
  onRefresh,
}: InsightsReportHeaderSectionProps) {
  return (
    <div className="mb-4 flex flex-col md:flex-row items-start justify-between gap-4">
      <div>
        <h2 className="mb-1 text-lg font-montserrat font-semibold text-[var(--text-primary)]">
          Relatório de Insights da IA
        </h2>
        <p className="max-w-2xl font-work-sans text-sm text-[var(--text-tertiary)]">
          Resumo estratégico gerado automaticamente a partir dos feedbacks,
          sentimentos e categorias identificadas pela IA, com foco em
          oportunidades de melhoria e pontos fortes da experiência do cliente.
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {updatedLabel && (
          <span className="font-work-sans text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
            Última atualização: {updatedLabel}
          </span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="btn-primary font-poppins px-4 py-2 text-sm disabled:opacity-60">
          {refreshing ? 'Atualizando...' : 'Atualizar insights com IA'}
        </button>
      </div>
    </div>
  );
}
