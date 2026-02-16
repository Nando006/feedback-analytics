import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksInsightsStatistics } from 'src/routes/loaders/loaderFeedbacksInsightsStatistics';

export default function FeedbacksInsightsStatistics() {
  const { summary, error } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsStatistics>>>();

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!summary || summary.totalAnalyzed === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--text-muted)]">
          Ainda não há dados suficientes para gerar estatísticas de insights.
        </div>
      </div>
    );
  }

  const total = summary.totalAnalyzed || 1;

  const positivePct = Math.round(
    (summary.sentiments.positive / total) * 100,
  );
  const neutralPct = Math.round((summary.sentiments.neutral / total) * 100);
  const negativePct = Math.round(
    (summary.sentiments.negative / total) * 100,
  );

  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Distribuição de sentimentos nos feedbacks
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Visão estatística da percepção geral dos clientes com base nos
          feedbacks analisados pela IA.
        </p>

        <div className="space-y-4">
          <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden flex">
            <div
              style={{ width: `${positivePct}%` }}
              className="h-full bg-emerald-500/70"
            />
            <div
              style={{ width: `${neutralPct}%` }}
              className="h-full bg-amber-500/70"
            />
            <div
              style={{ width: `${negativePct}%` }}
              className="h-full bg-rose-500/70"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                Positivos
              </div>
              <div className="text-xl font-semibold text-emerald-300">
                {summary.sentiments.positive} ({positivePct}%)
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                Neutros
              </div>
              <div className="text-xl font-semibold text-amber-300">
                {summary.sentiments.neutral} ({neutralPct}%)
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                Negativos
              </div>
              <div className="text-xl font-semibold text-rose-300">
                {summary.sentiments.negative} ({negativePct}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Principais categorias e temas
        </h3>

        {summary.topCategories.length === 0 ? (
          <div className="text-sm text-[var(--text-muted)]">
            Ainda não há categorias suficientes para exibir.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                Categorias mais mencionadas
              </div>
              <ul className="space-y-1">
                {summary.topCategories.map((cat) => (
                  <li
                    key={cat.name}
                    className="flex justify-between text-[var(--text-secondary)]">
                    <span>{cat.name}</span>
                    <span className="text-[var(--text-muted)]">
                      {cat.count}x
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
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
                      <span className="text-[var(--text-muted)]">
                        {kw.count}x
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
