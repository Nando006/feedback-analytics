import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksInsightsStatistics } from 'src/routes/loaders/loaderFeedbacksInsightsStatistics';
import InsightsStatisticsErrorState from 'components/user/feedbacksInsightsStatistics/InsightsStatisticsErrorState';
import InsightsStatisticsEmptyState from 'components/user/feedbacksInsightsStatistics/InsightsStatisticsEmptyState';
import InsightsStatisticsSentimentSection from 'components/user/feedbacksInsightsStatistics/InsightsStatisticsSentimentSection';
import InsightsStatisticsThemesSection from 'components/user/feedbacksInsightsStatistics/InsightsStatisticsThemesSection';

export default function FeedbacksInsightsStatistics() {
  const { summary, error } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsStatistics>>>();

  if (error) {
    return <InsightsStatisticsErrorState error={error} />;
  }

  if (!summary || summary.totalAnalyzed === 0) {
    return <InsightsStatisticsEmptyState />;
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
      <InsightsStatisticsSentimentSection
        summary={summary}
        positivePct={positivePct}
        neutralPct={neutralPct}
        negativePct={negativePct}
      />

      <InsightsStatisticsThemesSection summary={summary} />
    </div>
  );
}
