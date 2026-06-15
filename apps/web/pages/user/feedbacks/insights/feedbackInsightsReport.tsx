import { useState } from 'react';
import type { FeedbackAnalysisSummary } from 'lib/interfaces/domain/feedback.domain';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedInsightsReport } from 'src/lib/hooks/useScopedInsightsReport';
import InsightsReportLoadingState from 'components/user/pages/feedbacksInsightsReport/InsightsReportLoadingState';
import InsightsReportErrorState from 'components/user/pages/feedbacksInsightsReport/InsightsReportErrorState';
import InsightsReportHeaderSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportHeaderSection';
import InsightsReportMoodSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportMoodSection';
import InsightsReportContent from 'components/user/pages/feedbacksInsightsReport/InsightsReportContent';
import InsightsControlsBar from 'components/user/pages/feedbacksInsightsReport/InsightsControlsBar';
import PageHeader from 'components/user/shared/PageHeader';

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

  const mood = getMoodFromSummary(summary);

  const total = summary?.totalAnalyzed ?? 0;
  const positivePct =
    total > 0 ? Math.round((summary!.sentiments.positive / total) * 100) : 0;
  const neutralPct =
    total > 0 ? Math.round((summary!.sentiments.neutral / total) * 100) : 0;
  const negativePct =
    total > 0 ? Math.round((summary!.sentiments.negative / total) * 100) : 0;

  return (
    <>
      <div className="font-work-sans space-y-6 pb-8">
        <PageHeader actions={<InsightsControlsBar />} />
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
