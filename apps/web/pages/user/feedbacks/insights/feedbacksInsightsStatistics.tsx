import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksInsightsStatistics } from 'src/routes/loaders/loaderFeedbacksInsightsStatistics';
import InsightsStatisticsErrorState from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsErrorState';
import InsightsStatisticsEmptyState from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsEmptyState';
import InsightsStatisticsSentimentSection from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsSentimentSection';
import InsightsStatisticsThemesSection from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsThemesSection';
import InsightsStatisticsAspectsSection from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsAspectsSection';
import PageHeader from 'components/user/shared/PageHeader';
import InsightsStatisticsSkeleton from 'components/user/pages/feedbacks/insights/InsightsStatisticsSkeleton';
import { useScopedFeedbackAnalysis } from 'src/lib/hooks/useScopedFeedbackAnalysis';

export default function FeedbacksInsightsStatistics() {
  const initialData =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsStatistics>>>();
  const { summary, loading, error } = useScopedFeedbackAnalysis(initialData);

  const total = summary?.totalAnalyzed || 1;
  const positivePct = Math.round(
    ((summary?.sentiments.positive ?? 0) / total) * 100,
  );
  const neutralPct = Math.round(
    ((summary?.sentiments.neutral ?? 0) / total) * 100,
  );
  const negativePct = Math.round(
    ((summary?.sentiments.negative ?? 0) / total) * 100,
  );

  return (
    <div className="font-work-sans space-y-6">
      <PageHeader />

      {loading ? (
        <InsightsStatisticsSkeleton />
      ) : error ? (
        <InsightsStatisticsErrorState error={error} />
      ) : !summary || summary.totalAnalyzed === 0 ? (
        <InsightsStatisticsEmptyState />
      ) : (
        <>
          <InsightsStatisticsSentimentSection
            summary={summary}
            positivePct={positivePct}
            neutralPct={neutralPct}
            negativePct={negativePct}
          />

          <InsightsStatisticsThemesSection summary={summary} />

          <InsightsStatisticsAspectsSection aspects={summary.aspectSentiments} />
        </>
      )}
    </div>
  );
}
