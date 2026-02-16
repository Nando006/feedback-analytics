import { useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { FeedbackAnalysisItem } from 'lib/interfaces/user/feedback';
import type { LoaderFeedbacksInsightsEmotional } from 'src/routes/loaders/loaderFeedbacksInsightsEmotional';

type EmotionalCluster = {
  title: string;
  description: string;
  tone: 'positive' | 'neutral' | 'negative';
  items: FeedbackAnalysisItem[];
};

export default function FeedbacksInsigthsEmotional() {
  const { items, summary, error } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsEmotional>>>();

  const clusters = useMemo<EmotionalCluster[]>(() => {
    if (!items.length) return [];

    const mostNegative = [...items]
      .filter((i) => i.sentiment === 'negative')
      .sort((a, b) => (a.rating ?? 3) - (b.rating ?? 3))
      .slice(0, 5);

    const mostPositive = [...items]
      .filter((i) => i.sentiment === 'positive')
      .sort((a, b) => (b.rating ?? 3) - (a.rating ?? 3))
      .slice(0, 5);

    const mostNeutral = [...items]
      .filter((i) => i.sentiment === 'neutral')
      .slice(0, 5);

    const clustersOut: EmotionalCluster[] = [];

    if (mostPositive.length > 0) {
      clustersOut.push({
        title: 'Momentos que encantam',
        description:
          'Feedbacks onde os clientes demonstram entusiasmo e reconhecimento pelo que sua empresa faz bem.',
        tone: 'positive',
        items: mostPositive,
      });
    }

    if (mostNegative.length > 0) {
      clustersOut.push({
        title: 'Pontos de dor mais intensos',
        description:
          'Mensagens com maior carga negativa, que indicam frustrações claras na jornada do cliente.',
        tone: 'negative',
        items: mostNegative,
      });
    }

    if (mostNeutral.length > 0) {
      clustersOut.push({
        title: 'Feedbacks neutros e ambivalentes',
        description:
          'Opiniões que não são claramente positivas ou negativas, mas revelam oportunidades sutis de melhoria.',
        tone: 'neutral',
        items: mostNeutral,
      });
    }

    return clustersOut;
  }, [items]);

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
          Ainda não há feedbacks suficientes analisados para gerar insights
          emocionais.
        </div>
      </div>
    );
  }

  const total = summary.totalAnalyzed;
  const positivePct = Math.round(
    (summary.sentiments.positive / total) * 100,
  );
  const neutralPct = Math.round((summary.sentiments.neutral / total) * 100);
  const negativePct = Math.round(
    (summary.sentiments.negative / total) * 100,
  );

  return (
    <div className="font-inter space-y-6">
      {/* Termômetro emocional */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card space-y-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Termômetro emocional dos clientes
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-2xl">
          Visualização da intensidade emocional dos feedbacks, destacando onde
          os clientes estão mais satisfeitos e onde sentem maior frustração.
        </p>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
          <div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Positivos
            </div>
            <div className="text-xl font-semibold text-emerald-300">
              {summary.sentiments.positive} ({positivePct}%)
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Neutros
            </div>
            <div className="text-xl font-semibold text-amber-300">
              {summary.sentiments.neutral} ({neutralPct}%)
            </div>
          </div>
          <div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
              Negativos
            </div>
            <div className="text-xl font-semibold text-rose-300">
              {summary.sentiments.negative} ({negativePct}%)
            </div>
          </div>
        </div>
      </div>

      {/* Clusters emocionais */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card space-y-6">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          Momentos emocionais que mais se repetem
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-2xl mb-2">
          Explore exemplos reais de feedbacks que representam emoções mais
          fortes dos seus clientes — tanto positivas quanto negativas.
        </p>

        {clusters.length === 0 ? (
          <div className="text-sm text-[var(--text-muted)]">
            Ainda não há clusters emocionais suficientes para exibir.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clusters.map((cluster) => (
              <div
                key={cluster.title}
                className="border border-neutral-800 rounded-xl bg-neutral-900/80 p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                    {cluster.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    {cluster.description}
                  </p>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {cluster.items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-neutral-800 rounded-lg bg-neutral-950/60 p-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                        <span>
                          {new Date(item.created_at).toLocaleDateString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                            },
                          )}
                        </span>
                        <span>
                          Rating: {item.rating ?? '—'} ·{' '}
                          {item.sentiment === 'positive'
                            ? 'Positivo'
                            : item.sentiment === 'negative'
                            ? 'Negativo'
                            : 'Neutro'}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
