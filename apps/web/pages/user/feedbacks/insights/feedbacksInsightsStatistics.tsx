import { useCallback, useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFeedbacksInsightsStatistics } from 'src/routes/loaders/loaderFeedbacksInsightsStatistics';
import InsightsStatisticsErrorState from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsErrorState';
import InsightsStatisticsEmptyState from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsEmptyState';
import InsightsStatisticsSentimentSection from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsSentimentSection';
import InsightsStatisticsThemesSection from 'components/user/pages/feedbacksInsightsStatistics/InsightsStatisticsThemesSection';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import type { FeedbackAnalysisSummary } from 'lib/interfaces/domain/feedback.domain';
import { ServiceGetFeedbackAnalysis } from 'src/services/serviceFeedbacks';
import InsightsStatisticsSkeleton from 'components/user/pages/feedbacks/insights/InsightsStatisticsSkeleton';

export default function FeedbacksInsightsStatistics({ isTab = false }: { isTab?: boolean }) {
  const loaderData = useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsStatistics>>>();
  const { scope, catalogItemId } = useInsightsControls();

  const [summary, setSummary] = useState<FeedbackAnalysisSummary | null>(null);
  const [loading, setLoading] = useState(!isTab);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const scopeParam = scope;
    const catalogParam = scopeParam !== 'COMPANY' ? catalogItemId || undefined : undefined;

    try {
      const response = await ServiceGetFeedbackAnalysis({
        scope_type: scopeParam,
        catalog_item_id: catalogParam,
      });

      setSummary(response.summary);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas de insights');
    } finally {
      setLoading(false);
    }
  }, [scope, catalogItemId]);

  useEffect(() => {
    if (isTab) {
      fetchData();
    } else if (loaderData) {
      setSummary(loaderData.summary);
      setError(loaderData.error);
      setLoading(false);
    }
  }, [isTab, loaderData, fetchData]);

  if (loading) {
    return <InsightsStatisticsSkeleton />;
  }

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
    <div className="font-work-sans space-y-6">
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
