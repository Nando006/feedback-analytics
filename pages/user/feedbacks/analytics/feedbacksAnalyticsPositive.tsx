import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksAnalyticsPositive } from 'src/routes/loaders/loaderFeedbacksAnalyticsPositive';
import AnalyticsPositiveErrorState from 'components/user/feedbacksAnalyticsPositive/AnalyticsPositiveErrorState';
import AnalyticsPositiveEmptyState from 'components/user/feedbacksAnalyticsPositive/AnalyticsPositiveEmptyState';
import AnalyticsPositiveSummarySection from 'components/user/feedbacksAnalyticsPositive/AnalyticsPositiveSummarySection';
import AnalyticsPositiveItemsSection from 'components/user/feedbacksAnalyticsPositive/AnalyticsPositiveItemsSection';

export default function FeedbacksAnalyticsPositive() {
  const { items, summary, error } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsPositive>>>();

  if (error) {
    return <AnalyticsPositiveErrorState error={error} />;
  }

  if (!summary || summary.totalAnalyzed === 0) {
    return <AnalyticsPositiveEmptyState />;
  }

  return (
    <div className="font-inter space-y-6">
      <AnalyticsPositiveSummarySection summary={summary} />

      <AnalyticsPositiveItemsSection items={items} />
    </div>
  );
}
