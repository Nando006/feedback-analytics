import type { AnalyticsNegativeSummarySectionProps } from './ui.types';

export default function AnalyticsNegativeSummarySection({
  summary,
}: AnalyticsNegativeSummarySectionProps) {
  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <h2 className="mb-2 text-lg font-montserrat font-semibold text-[var(--text-primary)]">
        Pontos de atenção e oportunidades de melhoria
      </h2>
      <p className="mb-4 text-sm text-[var(--text-tertiary)]">
        Feedbacks com sentimento negativo ajudam a identificar gargalos na jornada
        do cliente e oportunidades claras de ação.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Total negativos
          </div>
          <div className="text-2xl font-semibold text-rose-300">
            {summary.sentiments.negative}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Principais problemas apontados
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {summary.topCategories.slice(0, 5).map((cat) => (
              <span
                key={cat.name}
                className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-rose-200">
                {cat.name} ({cat.count})
              </span>
            ))}
            {summary.topCategories.length === 0 && (
              <span className="text-[var(--text-tertiary)]">
                Nenhum problema recorrente identificado ainda.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
