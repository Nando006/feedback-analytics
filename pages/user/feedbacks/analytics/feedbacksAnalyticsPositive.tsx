import { useEffect, useState } from 'react';
import { ServiceGetFeedbackAnalysis } from 'src/services/serviceFeedbacks';
import type {
  FeedbackAnalysisItem,
  FeedbackAnalysisSummary,
} from 'lib/interfaces/user/feedback';

export default function FeedbacksAnalyticsPositive() {
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
        const response = await ServiceGetFeedbackAnalysis({
          sentiment: 'positive',
        });
        if (!mounted) return;
        setItems(response.items);
        setSummary(response.summary);
      } catch (err) {
        console.error(
          'Erro ao carregar analytics de feedbacks positivos (IA):',
          err,
        );
        if (!mounted) return;
        setError('Erro ao carregar analytics de feedbacks positivos');
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
          Carregando feedbacks positivos...
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
          Ainda não há feedbacks positivos analisados pela IA.
        </div>
      </div>
    );
  }

  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Forças e destaques percebidos pelos clientes
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Feedbacks com sentimento positivo ajudam a entender o que está
          funcionando bem na experiência do cliente.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Total positivos
            </div>
            <div className="text-2xl font-semibold text-emerald-300">
              {summary.sentiments.positive}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Principais temas elogiados
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {summary.topCategories.slice(0, 5).map((cat) => (
                <span
                  key={cat.name}
                  className="px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
                  {cat.name} ({cat.count})
                </span>
              ))}
              {summary.topCategories.length === 0 && (
                <span className="text-[var(--text-muted)]">
                  Nenhum tema recorrente identificado ainda.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card">
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Feedbacks positivos analisados
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-500/60 bg-emerald-500/10 text-emerald-300">
                    Positivo
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
