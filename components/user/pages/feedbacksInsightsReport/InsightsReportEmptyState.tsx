interface PropsInsightsReportEmptyState {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function InsightsReportEmptyState({
  refreshing,
  onRefresh,
}: PropsInsightsReportEmptyState) {
  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Relatório de Insights da IA
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Gere um relatório inteligente a partir dos feedbacks já analisados
              pela IA.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-neutral-800 disabled:opacity-60">
            {refreshing ? 'Atualizando...' : 'Gerar relatório com IA'}
          </button>
        </div>

        <div className="mt-2 text-sm text-[var(--text-muted)]">
          Ainda não há um relatório gerado. Clique em{' '}
          <span className="font-medium text-[var(--text-secondary)]">
            &quot;Gerar relatório com IA&quot;
          </span>{' '}
          para que o sistema analise os feedbacks, categorize sentimentos e
          produza um resumo com recomendações.
        </div>
      </div>
    </div>
  );
}
