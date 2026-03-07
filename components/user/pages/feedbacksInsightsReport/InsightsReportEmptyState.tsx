import type { InsightsReportEmptyStateProps } from './ui.types';

export default function InsightsReportEmptyState({
  refreshing,
  onRefresh,
}: InsightsReportEmptyStateProps) {
  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Relatório de Insights da IA
            </h2>
            <p className="text-sm text-[var(--text-tertiary)]">
              Gere um relatório inteligente a partir dos feedbacks já analisados
              pela IA.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-60">
            {refreshing ? 'Atualizando...' : 'Gerar relatório com IA'}
          </button>
        </div>

        <div className="mt-2 text-sm text-(--text-tertiary)">
          Ainda não há um relatório gerado. Clique em{' '}
          <span className="font-medium text-(--text-secondary)">
            &quot;Gerar relatório com IA&quot;
          </span>{' '}
          para que o sistema analise os feedbacks, categorize sentimentos e
          produza um resumo com recomendações.
        </div>
      </div>
    </div>
  );
}
