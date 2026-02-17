import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksAnalyticsNegative } from 'src/routes/loaders/loaderFeedbacksAnalyticsNegative';
import AnalyticsNegativeErrorState from 'components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeErrorState';
import AnalyticsNegativeEmptyState from 'components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeEmptyState';
import AnalyticsNegativeSummarySection from 'components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeSummarySection';
import AnalyticsNegativeItemsSection from 'components/user/pages/feedbacksAnalyticsNegative/AnalyticsNegativeItemsSection';

export default function FeedbacksAnalyticsNegative() {
  const { items, summary, error } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsNegative>>>();

  if (error) {
    return <AnalyticsNegativeErrorState error={error} />;
  }

  if (!summary || summary.totalAnalyzed === 0) {
    return <AnalyticsNegativeEmptyState />;
  }

  return (
    <div className="font-inter space-y-6">
      <AnalyticsNegativeSummarySection summary={summary} />

      <AnalyticsNegativeItemsSection items={items} />
    </div>
  );
}
