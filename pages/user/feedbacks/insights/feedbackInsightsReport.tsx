import { useEffect } from 'react';
import { useFetcher, useLoaderData, useRevalidator } from 'react-router-dom';
import type {
  FeedbackAnalysisSummary,
} from 'lib/interfaces/domain/feedback.domain';
import type { LoaderFeedbacksInsightsReport } from 'src/routes/loaders/loaderFeedbacksInsightsReport';
import { INTENT_FEEDBACK_RUN_IA } from 'lib/constants/routes/intents';
import InsightsReportLoadingState from 'components/user/pages/feedbacksInsightsReport/InsightsReportLoadingState';
import InsightsReportErrorState from 'components/user/pages/feedbacksInsightsReport/InsightsReportErrorState';
import InsightsReportEmptyState from 'components/user/pages/feedbacksInsightsReport/InsightsReportEmptyState';
import InsightsReportHeaderSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportHeaderSection';
import InsightsReportMoodSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportMoodSection';
import InsightsReportSummarySection from 'components/user/pages/feedbacksInsightsReport/InsightsReportSummarySection';
import InsightsReportRecommendationsSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportRecommendationsSection';
import type { FeedbackInsightsReportActionData } from './ui.types';

function getMoodFromSummary(summary: FeedbackAnalysisSummary | null) {
  if (!summary || summary.totalAnalyzed === 0) {
    return {
      label: 'Sem dados suficientes',
      tone: 'neutral' as const,
      description:
        'Ainda não há feedbacks suficientes analisados pela IA para determinar o clima emocional.',
    };
  }

  const { positive, neutral, negative } = summary.sentiments;
  const max = Math.max(positive, neutral, negative);

  if (max === positive) {
    return {
      label: 'Clima Positivo',
      tone: 'positive' as const,
      description:
        'A maioria dos feedbacks recentes está positiva, indicando satisfação geral com a experiência.',
    };
  }

  if (max === negative) {
    return {
      label: 'Clima de Atenção',
      tone: 'negative' as const,
      description:
        'Há concentração de feedbacks negativos, sugerindo pontos críticos que precisam de ação imediata.',
    };
  }

  return {
    label: 'Clima Neutro',
    tone: 'neutral' as const,
    description:
      'Os feedbacks estão balanceados entre elogios e reclamações, apontando espaço claro para melhoria.',
  };
}

export default function FeedbacksInsightsReport() {
  const { report, summary, error: loaderError } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsReport>>>();
  const revalidator = useRevalidator();
  const fetcher = useFetcher<FeedbackInsightsReportActionData>();

  const refreshing =
    fetcher.state !== 'idle' || revalidator.state === 'loading';
  const error = fetcher.data?.error ?? loaderError;

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.ok) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  const handleRefreshClick = () => {
    const form = new FormData();
    form.set('intent', INTENT_FEEDBACK_RUN_IA);
    fetcher.submit(form, { method: 'post' });
  };

  if (refreshing && !report && !summary && !loaderError) {
    return <InsightsReportLoadingState />;
  }

  if (error) {
    return <InsightsReportErrorState error={error} />;
  }

  const hasContent =
    report && ((report.summary && report.summary.trim().length > 0) ||
      (report.recommendations && report.recommendations.length > 0));

  if (!hasContent) {
    return (
      <InsightsReportEmptyState
        refreshing={refreshing}
        onRefresh={handleRefreshClick}
      />
    );
  }

  const updatedLabel =
    report?.updatedAt != null
      ? new Date(report.updatedAt).toLocaleString('pt-BR')
      : null;

  const mood = getMoodFromSummary(summary);

  const total = summary?.totalAnalyzed ?? 0;
  const positivePct =
    total > 0 ? Math.round((summary!.sentiments.positive / total) * 100) : 0;
  const neutralPct =
    total > 0 ? Math.round((summary!.sentiments.neutral / total) * 100) : 0;
  const negativePct =
    total > 0 ? Math.round((summary!.sentiments.negative / total) * 100) : 0;

  return (
    <div className="font-inter space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 glass-card space-y-6">
        <InsightsReportHeaderSection
          updatedLabel={updatedLabel}
          refreshing={refreshing}
          onRefresh={handleRefreshClick}
        />

        <InsightsReportMoodSection
          mood={mood}
          summary={summary}
          positivePct={positivePct}
          neutralPct={neutralPct}
          negativePct={negativePct}
        />

        {report?.summary && report.summary.trim().length > 0 && (
          <InsightsReportSummarySection summaryText={report.summary} />
        )}

        {report?.recommendations && report.recommendations.length > 0 && (
          <InsightsReportRecommendationsSection
            recommendations={report.recommendations}
          />
        )}
      </div>
    </div>
  );
}
