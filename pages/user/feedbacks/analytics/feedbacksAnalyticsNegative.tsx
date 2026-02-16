import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksAnalyticsNegative } from 'src/routes/loaders/loaderFeedbacksAnalyticsNegative';

export default function FeedbacksAnalyticsNegative() {
  const { items, summary, error } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsNegative>>>();

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
          Ainda não há feedbacks negativos analisados pela IA.
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Pontos de atenção e oportunidades de melhoria
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Feedbacks com sentimento negativo ajudam a identificar gargalos na
          jornada do cliente e oportunidades claras de ação.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Total negativos
            </div>
            <div className="text-2xl font-semibold text-rose-300">
              {summary.sentiments.negative}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Principais problemas apontados
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {summary.topCategories.slice(0, 5).map((cat) => (
                <span
                  key={cat.name}
                  className="px-3 py-1 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-200">
                  {cat.name} ({cat.count})
                </span>
              ))}
              {summary.topCategories.length === 0 && (
                <span className="text-[var(--text-muted)]">
                  Nenhum problema recorrente identificado ainda.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Feedbacks negativos analisados
        </h3>

        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/80 space-y-2">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(item.created_at).toLocaleString('pt-BR')}
                </span>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-neutral-700 text-[var(--text-secondary)]">
                    Rating: {item.rating ?? '—'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-rose-500/60 bg-rose-500/10 text-rose-300">
                    Negativo
                  </span>
                </div>
              </div>

              <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                {item.message}
              </p>

              {(item.categories.length > 0 || item.keywords.length > 0) && (
                <div className="flex flex-wrap gap-3 text-[10px] mt-2">
                  {item.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="uppercase tracking-wide text-[var(--text-muted)]">
                        Categorias:
                      </span>
                      {item.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-800 text-[var(--text-secondary)]">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="uppercase tracking-wide text-[var(--text-muted)]">
                        Palavras-chave:
                      </span>
                      {item.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-full border border-neutral-700 bg-neutral-800 text-[var(--text-secondary)]">
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
    </div>
  );
}
