import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksAnalyticsPositive } from 'src/routes/loaders/loaderFeedbacksAnalyticsPositive';
import AnalyticsPositiveErrorState from 'components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveErrorState';
import AnalyticsPositiveEmptyState from 'components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveEmptyState';
import AnalyticsPositiveSummarySection from 'components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveSummarySection';
import AnalyticsPositiveItemsSection from 'components/user/pages/feedbacksAnalyticsPositive/AnalyticsPositiveItemsSection';

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
    <div className="font-work-sans space-y-6">
      <AnalyticsPositiveSummarySection summary={summary} />

      <AnalyticsPositiveItemsSection items={items} />
    </div>
  );
}
