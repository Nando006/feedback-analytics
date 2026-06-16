import { useState } from 'react';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedInsightsReport } from 'src/lib/hooks/useScopedInsightsReport';
import { climateFromNss, shouldShowNss } from 'src/lib/utils/statistics';
import InsightsReportLoadingState from 'components/user/pages/feedbacksInsightsReport/InsightsReportLoadingState';
import InsightsReportErrorState from 'components/user/pages/feedbacksInsightsReport/InsightsReportErrorState';
import InsightsReportHeaderSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportHeaderSection';
import InsightsReportMoodSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportMoodSection';
import InsightsReportContent from 'components/user/pages/feedbacksInsightsReport/InsightsReportContent';
import PageHeader from 'components/user/shared/PageHeader';

export default function FeedbacksInsightsReport() {
  const { canAnalyze, isRegeneratingInsights } = useInsightsControls();

  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  // Dados carregados sob demanda por escopo (com análise para o card de clima).
  const { report, summary, loading, error: fetchError } = useScopedInsightsReport({
    withAnalysis: true,
  });

  const refreshing = isRegeneratingInsights || loading;
  const errorKey = fetchError ? `fetch:${fetchError}` : null;
  const showErrorPopup = Boolean(errorKey && dismissedErrorKey !== errorKey);

  const analysisBlockedMessage = canAnalyze
    ? null
    : 'Para analisar os feedbacks, preencha as informações da empresa em Editar > Configuração de Coleta de Dados.';

  if (loading && !report && !summary && !fetchError) {
    return <InsightsReportLoadingState />;
  }

  const updatedLabel =
    report?.updatedAt != null
      ? new Date(report.updatedAt).toLocaleString('pt-BR')
      : null;

  const total = summary?.totalAnalyzed ?? 0;
  const mood = climateFromNss(summary?.netSentimentScore, summary?.confidenceTier, total);

  const positivePct =
    total > 0 ? Math.round((summary!.sentiments.positive / total) * 100) : 0;
  const neutralPct =
    total > 0 ? Math.round((summary!.sentiments.neutral / total) * 100) : 0;
  const negativePct =
    total > 0 ? Math.round((summary!.sentiments.negative / total) * 100) : 0;

  return (
    <>
      <div className="font-work-sans space-y-6 pb-8">
        <PageHeader />

        <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card space-y-6">
          <InsightsReportHeaderSection
            updatedLabel={updatedLabel}
            canAnalyze={canAnalyze}
            analysisBlockedMessage={analysisBlockedMessage}
          />

          <InsightsReportMoodSection
            mood={mood}
            summary={summary}
            positivePct={positivePct}
            neutralPct={neutralPct}
            negativePct={negativePct}
            nss={summary?.netSentimentScore}
            confidenceTier={summary?.confidenceTier}
            showNss={shouldShowNss(summary?.confidenceTier)}
          />

          <InsightsReportContent report={report} />

          {refreshing && (
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/38 backdrop-blur-[1px]" />
          )}
        </div>
      </div>

      {showErrorPopup && fetchError && (
        <InsightsReportErrorState
          error={fetchError}
          variant="error"
          onClose={() => setDismissedErrorKey(errorKey)}
        />
      )}
    </>
  );
}
