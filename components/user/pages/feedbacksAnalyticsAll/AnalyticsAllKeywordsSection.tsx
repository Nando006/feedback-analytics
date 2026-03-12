import type { AnalyticsAllKeywordsSectionProps } from './ui.types';

export default function AnalyticsAllKeywordsSection({
  summary,
}: AnalyticsAllKeywordsSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <h3 className="mb-4 text-base font-montserrat font-semibold text-[var(--text-primary)]">
        Palavras-chave mais recorrentes
      </h3>
      {summary.topKeywords.length === 0 ? (
        <div className="font-work-sans text-sm text-[var(--text-tertiary)]">
          Nenhuma palavra-chave identificada até o momento.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 text-xs">
          {summary.topKeywords.map((kw) => (
            <span
              key={kw.name}
              className="font-work-sans rounded-full border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-1 text-(--text-secondary)">
              {kw.name} ({kw.count})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
