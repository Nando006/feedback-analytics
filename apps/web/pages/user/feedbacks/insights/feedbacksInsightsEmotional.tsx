import { useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksInsightsEmotional } from 'src/routes/loaders/loaderFeedbacksInsightsEmotional';
import InsightsEmotionalErrorState from 'components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalErrorState';
import InsightsEmotionalEmptyState from 'components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalEmptyState';
import InsightsEmotionalThermometerSection from 'components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalThermometerSection';
import InsightsEmotionalClustersSection from 'components/user/pages/feedbacksInsightsEmotional/InsightsEmotionalClustersSection';
import type { EmotionalCluster } from 'components/user/pages/feedbacksInsightsEmotional/ui.types';
import PageHeader from 'components/user/shared/PageHeader';
import { useScopedFeedbackAnalysis } from 'src/lib/hooks/useScopedFeedbackAnalysis';

export default function FeedbacksInsigthsEmotional() {
  const initialData =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsEmotional>>>();
  const { items, summary, error } = useScopedFeedbackAnalysis(initialData);

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

    const divergent = items.filter((i) => i.discrepancy != null).slice(0, 5);
    if (divergent.length > 0) {
      clustersOut.push({
        title: 'Divergências (nota × texto)',
        description:
          'A nota em estrelas e o sentimento do texto discordam — ex.: nota alta com texto negativo (detrator silencioso) ou nota baixa com texto positivo.',
        tone: 'negative',
        items: divergent,
      });
    }

    return clustersOut;
  }, [items]);

  const total = summary?.totalAnalyzed ?? 0;
  const positivePct = total
    ? Math.round((summary!.sentiments.positive / total) * 100)
    : 0;
  const neutralPct = total
    ? Math.round((summary!.sentiments.neutral / total) * 100)
    : 0;
  const negativePct = total
    ? Math.round((summary!.sentiments.negative / total) * 100)
    : 0;

  return (
    <div className="font-work-sans space-y-6">
      <PageHeader />

      {error ? (
        <InsightsEmotionalErrorState error={error} />
      ) : !summary || summary.totalAnalyzed === 0 ? (
        <InsightsEmotionalEmptyState />
      ) : (
        <>
          <InsightsEmotionalThermometerSection
            summary={summary}
            positivePct={positivePct}
            neutralPct={neutralPct}
            negativePct={negativePct}
          />

          <InsightsEmotionalClustersSection clusters={clusters} />
        </>
      )}
    </div>
  );
}
