import type { AnalyticsAllSummarySectionProps } from './ui.types';

export default function AnalyticsAllSummarySection({
  summary,
}: AnalyticsAllSummarySectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <h2 className="mb-2 text-lg font-montserrat font-semibold text-[var(--text-primary)]">
        Visão geral dos feedbacks analisados pela IA
      </h2>
      <p className="mb-4 font-work-sans text-sm text-[var(--text-tertiary)]">
        Resumo automático gerado a partir dos feedbacks e da categorização de
        sentimentos.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <p className="font-work-sans text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Total analisados
          </p>
          <div className="font-work-sans text-2xl font-semibold text-[var(--text-primary)]">
            {summary.totalAnalyzed}
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-work-sans text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Sentimentos
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="font-poppins rounded-full border border-(--positive)/40 bg-(--positive)/10 px-3 py-1 text-(--positive)">
              Positivos: {summary.sentiments.positive}
            </span>
            <span className="font-poppins rounded-full border border-(--neutral)/40 bg-(--neutral)/10 px-3 py-1 text-(--neutral)">
              Neutros: {summary.sentiments.neutral}
            </span>
            <span className="font-poppins rounded-full border border-(--negative)/40 bg-(--negative)/10 px-3 py-1 text-(--negative)">
              Negativos: {summary.sentiments.negative}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-work-sans text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
            Principais categorias
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {summary.topCategories.slice(0, 3).map((cat) => (
              <span
                key={cat.name}
                className="rounded-full border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-1 text-(--text-secondary)">
                {cat.name} ({cat.count})
              </span>
            ))}
            {summary.topCategories.length === 0 && (
              <span className="font-work-sans text-[var(--text-tertiary)]">
                Nenhuma categoria identificada.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
