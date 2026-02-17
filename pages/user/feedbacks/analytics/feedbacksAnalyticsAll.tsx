import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksAnalyticsAll } from 'src/routes/loaders/loaderFeedbacksAnalyticsAll';
import AnalyticsAllErrorState from 'components/user/feedbacksAnalyticsAll/AnalyticsAllErrorState';
import AnalyticsAllEmptyState from 'components/user/feedbacksAnalyticsAll/AnalyticsAllEmptyState';
import AnalyticsAllSummarySection from 'components/user/feedbacksAnalyticsAll/AnalyticsAllSummarySection';
import AnalyticsAllKeywordsSection from 'components/user/feedbacksAnalyticsAll/AnalyticsAllKeywordsSection';
import AnalyticsAllItemsSection from 'components/user/feedbacksAnalyticsAll/AnalyticsAllItemsSection';

export default function FeedbacksAnalyticsAll() {
  const { items, summary, error } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksAnalyticsAll>>>();

  if (error) {
    return <AnalyticsAllErrorState error={error} />;
  }

  if (!summary || summary.totalAnalyzed === 0) {
    return <AnalyticsAllEmptyState />;
  }

  return (
    <div className="font-inter space-y-6">
      <AnalyticsAllSummarySection summary={summary} />

      <AnalyticsAllKeywordsSection summary={summary} />

      <AnalyticsAllItemsSection items={items} />
    </div>
  );
}
