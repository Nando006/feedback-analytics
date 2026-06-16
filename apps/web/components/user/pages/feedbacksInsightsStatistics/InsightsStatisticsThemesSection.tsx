import type { InsightsStatisticsThemesSectionProps } from './ui.types';

export default function InsightsStatisticsThemesSection({
  summary,
}: InsightsStatisticsThemesSectionProps) {
  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)] font-montserrat">
        Principais categorias e temas
      </h3>
      <p className="mb-4 text-xs text-[var(--text-tertiary)]">
        Ordenado por relevância (junta quantidade e consistência), não só pelo número de menções.
      </p>

      {summary.topCategories.length === 0 ? (
        <div className="text-sm text-[var(--text-tertiary)]">
          Ainda não há categorias suficientes para exibir.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              Categorias mais mencionadas
            </div>
            <ul className="space-y-1">
              {summary.topCategories.map((cat) => (
                <li
                  key={cat.name}
                  className="flex justify-between text-[var(--text-secondary)]">
                  <span>{cat.name}</span>
                  <span className="text-[var(--text-tertiary)]">
                    {cat.count}x
                    {typeof cat.proportion === 'number'
                      ? ` · ${Math.round(cat.proportion * 100)}%`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              Palavras-chave mais recorrentes
            </div>
            {summary.topKeywords.length === 0 ? (
              <div className="text-sm text-[var(--text-tertiary)]">
                Nenhuma palavra-chave recorrente identificada.
              </div>
            ) : (
              <ul className="space-y-1">
                {summary.topKeywords.map((kw) => (
                  <li
                    key={kw.name}
                    className="flex justify-between text-[var(--text-secondary)]">
                    <span>{kw.name}</span>
                    <span className="text-[var(--text-tertiary)]">
                      {kw.count}x
                      {typeof kw.proportion === 'number'
                        ? ` · ${Math.round(kw.proportion * 100)}%`
                        : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
