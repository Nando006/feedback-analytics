import type { AnalyticsNegativeItemsSectionProps } from './ui.types';

export default function AnalyticsNegativeItemsSection({
  items,
}: AnalyticsNegativeItemsSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <h3 className="mb-4 text-base font-montserrat font-semibold text-[var(--text-primary)]">
        Feedbacks negativos analisados
      </h3>

      <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="space-y-2 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-[var(--text-tertiary)]">
                {new Date(item.created_at).toLocaleString('pt-BR')}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-work-sans rounded-full border border-(--quaternary-color)/14 px-2 py-0.5 text-[10px] font-medium text-(--text-secondary)">
                  Rating: {item.rating ?? '—'}
                </span>
                <span className="font-work-sans rounded-full border border-rose-500/60 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                  Negativo
                </span>
              </div>  
            </div>

            <p className="font-work-sans whitespace-pre-wrap text-sm text-[var(--text-primary)]">
              {item.message}
            </p>

            {(item.categories.length > 0 || item.keywords.length > 0) && (
              <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
                {item.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-work-sans uppercase tracking-wide text-[var(--text-tertiary)]">
                      Categorias:
                    </span>
                    {item.categories.map((cat) => (
                      <span
                        key={cat}
                        className="font-work-sans rounded-full border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-2 py-0.5 text-(--text-secondary)">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}

                {item.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-work-sans uppercase tracking-wide text-[var(--text-tertiary)]">
                      Palavras-chave:
                    </span>
                    {item.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="font-work-sans rounded-full border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-2 py-0.5 text-(--text-secondary)">
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
