import type { AnalyticsAllKeywordsSectionProps } from './ui.types';

export default function AnalyticsAllKeywordsSection({
  summary,
}: AnalyticsAllKeywordsSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
      <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
        Palavras-chave mais recorrentes
      </h3>
      {summary.topKeywords.length === 0 ? (
        <div className="text-sm text-[var(--text-muted)]">
          Nenhuma palavra-chave identificada até o momento.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 text-xs">
          {summary.topKeywords.map((kw) => (
            <span
              key={kw.name}
              className="rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-[var(--text-secondary)]">
              {kw.name} ({kw.count})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
