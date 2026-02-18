import type { InsightsStatisticsThemesSectionProps } from './ui.types';

export default function InsightsStatisticsThemesSection({
  summary,
}: InsightsStatisticsThemesSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
      <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
        Principais categorias e temas
      </h3>

      {summary.topCategories.length === 0 ? (
        <div className="text-sm text-[var(--text-muted)]">
          Ainda não há categorias suficientes para exibir.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
              Categorias mais mencionadas
            </div>
            <ul className="space-y-1">
              {summary.topCategories.map((cat) => (
                <li
                  key={cat.name}
                  className="flex justify-between text-[var(--text-secondary)]">
                  <span>{cat.name}</span>
                  <span className="text-[var(--text-muted)]">{cat.count}x</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
              Palavras-chave mais recorrentes
            </div>
            {summary.topKeywords.length === 0 ? (
              <div className="text-sm text-[var(--text-muted)]">
                Nenhuma palavra-chave recorrente identificada.
              </div>
            ) : (
              <ul className="space-y-1">
                {summary.topKeywords.map((kw) => (
                  <li
                    key={kw.name}
                    className="flex justify-between text-[var(--text-secondary)]">
                    <span>{kw.name}</span>
                    <span className="text-[var(--text-muted)]">{kw.count}x</span>
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
