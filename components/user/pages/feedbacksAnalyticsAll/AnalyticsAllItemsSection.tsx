import type { AnalyticsAllItemsSectionProps } from './ui.types';

import { sentimentLabel } from 'lib/utils/sentiment';

function sentimentClass(sentiment: 'positive' | 'neutral' | 'negative') {
  if (sentiment === 'positive') {
    return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300';
  }

  if (sentiment === 'negative') {
    return 'border-rose-500/60 bg-rose-500/10 text-rose-300';
  }

  return 'border-amber-500/60 bg-amber-500/10 text-amber-300';
}

export default function AnalyticsAllItemsSection({
  items,
}: AnalyticsAllItemsSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
      <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
        Lista de feedbacks analisados
      </h3>
      <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(item.created_at).toLocaleString('pt-BR')}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                  Rating: {item.rating ?? '—'}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${sentimentClass(item.sentiment)}`}>
                  {sentimentLabel(item.sentiment)}
                </span>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm text-[var(--text-primary)]">
              {item.message}
            </p>

            {(item.categories.length > 0 || item.keywords.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
                {item.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="uppercase tracking-wide text-[var(--text-muted)]">
                      Categorias:
                    </span>
                    {item.categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[var(--text-secondary)]">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {item.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="uppercase tracking-wide text-[var(--text-muted)]">
                      Palavras-chave:
                    </span>
                    {item.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[var(--text-secondary)]">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
