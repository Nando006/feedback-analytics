import { useEffect, useState } from 'react';
import { ServiceGetFeedbackAnalysis } from 'src/services/serviceFeedbacks';
import type {
  FeedbackAnalysisItem,
  FeedbackAnalysisSummary,
} from 'lib/interfaces/user/feedback';

export default function FeedbacksAnalyticsAll() {
  const [items, setItems] = useState<FeedbackAnalysisItem[]>([]);
  const [summary, setSummary] = useState<FeedbackAnalysisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ServiceGetFeedbackAnalysis();
        if (!mounted) return;
        setItems(response.items);
        setSummary(response.summary);
      } catch (err) {
        console.error('Erro ao carregar analytics de feedbacks (IA):', err);
        if (!mounted) return;
        setError('Erro ao carregar analytics de feedbacks');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-primary)]">
          Carregando analytics de feedbacks...
        </div>
      </div>
    );
  }

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
          Ainda não há feedbacks analisados pela IA.
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Visão geral dos feedbacks analisados pela IA
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Resumo automático gerado a partir dos feedbacks e da categorização de
          sentimentos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Total analisados
            </div>
            <div className="text-2xl font-semibold text-[var(--text-primary)]">
              {summary.totalAnalyzed}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Sentimentos
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                Positivos: {summary.sentiments.positive}
              </span>
              <span className="px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
                Neutros: {summary.sentiments.neutral}
              </span>
              <span className="px-3 py-1 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-300">
                Negativos: {summary.sentiments.negative}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Principais categorias
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {summary.topCategories.slice(0, 3).map((cat) => (
                <span
                  key={cat.name}
                  className="px-3 py-1 rounded-full border border-neutral-700 bg-neutral-800 text-[var(--text-secondary)]">
                  {cat.name} ({cat.count})
                </span>
              ))}
              {summary.topCategories.length === 0 && (
                <span className="text-[var(--text-muted)]">
                  Nenhuma categoria identificada.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
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
                className="px-3 py-1 rounded-full border border-neutral-700 bg-neutral-800 text-[var(--text-secondary)]">
                {kw.name} ({kw.count})
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Lista de feedbacks analisados
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
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      item.sentiment === 'positive'
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                        : item.sentiment === 'negative'
                        ? 'border-rose-500/60 bg-rose-500/10 text-rose-300'
                        : 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                    }`}>
                    {item.sentiment === 'positive'
                      ? 'Positivo'
                      : item.sentiment === 'negative'
                      ? 'Negativo'
                      : 'Neutro'}
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
