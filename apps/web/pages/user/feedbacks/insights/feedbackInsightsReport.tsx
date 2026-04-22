import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FeedbackAnalysisSummary,
  FeedbackInsightsReport,
} from 'lib/interfaces/domain/feedback.domain';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import {
  ServiceGetFeedbackInsightsReport,
  ServiceGetFeedbackAnalysis,
} from 'src/services/serviceFeedbacks';
import InsightsReportLoadingState from 'components/user/pages/feedbacksInsightsReport/InsightsReportLoadingState';
import InsightsReportErrorState from 'components/user/pages/feedbacksInsightsReport/InsightsReportErrorState';
import InsightsReportHeaderSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportHeaderSection';
import InsightsReportMoodSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportMoodSection';
import InsightsReportSummarySection from 'components/user/pages/feedbacksInsightsReport/InsightsReportSummarySection';
import InsightsReportRecommendationsSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportRecommendationsSection';

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
  const {
    scope,
    catalogItemId,
    canAnalyze,
    isAnalyzingRaw,
    isRegeneratingInsights,
  } = useInsightsControls();

  const wasAnalyzingRawRef = useRef(false);
  const wasRegeneratingRef = useRef(false);
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  // Estado local para dados carregados sob demanda (por scope)
  const [report, setReport] = useState<FeedbackInsightsReport | null>(null);
  const [summary, setSummary] = useState<FeedbackAnalysisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Busca os dados do report sempre que scope ou catalogItemId mudar
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    const scopeParam = scope;
    const catalogParam = scopeParam !== 'COMPANY' ? catalogItemId || undefined : undefined;

    try {
      const [reportData, analysisData] = await Promise.all([
        ServiceGetFeedbackInsightsReport({
          scope_type: scopeParam,
          catalog_item_id: catalogParam,
        }).catch(() => null),
        ServiceGetFeedbackAnalysis({
          scope_type: scopeParam,
          catalog_item_id: catalogParam,
        }).catch(() => null),
      ]);

      setReport(reportData);
      setSummary(analysisData?.summary ?? null);

      if (reportData === null && analysisData === null) {
        setFetchError('Erro ao carregar relatório de insights');
      }
    } catch {
      setFetchError('Erro ao carregar relatório de insights');
    } finally {
      setLoading(false);
    }
  }, [scope, catalogItemId]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Recarrega quando análise bruta conclui
  useEffect(() => {
    if (isAnalyzingRaw) { wasAnalyzingRawRef.current = true; return; }
    if (!wasAnalyzingRawRef.current) return;
    wasAnalyzingRawRef.current = false;
    fetchReportData();
  }, [isAnalyzingRaw, fetchReportData]);

  // Recarrega quando geração de insights conclui
  useEffect(() => {
    if (isRegeneratingInsights) { wasRegeneratingRef.current = true; return; }
    if (!wasRegeneratingRef.current) return;
    wasRegeneratingRef.current = false;
    fetchReportData();
  }, [isRegeneratingInsights, fetchReportData]);

  const refreshing = isRegeneratingInsights || loading;
  const errorKey = fetchError ? `fetch:${fetchError}` : null;
  const showErrorPopup = Boolean(errorKey && dismissedErrorKey !== errorKey);

  const analysisBlockedMessage = canAnalyze
    ? null
    : 'Para analisar os feedbacks, preencha as informações da empresa em Editar > Configuração de Coleta de Dados.';

  if (loading && !report && !summary && !fetchError) {
    return <InsightsReportLoadingState />;
  }

  const hasContent =
    report && ((report.summary && report.summary.trim().length > 0) ||
      (report.recommendations && report.recommendations.length > 0));

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

          {!hasContent && (
            <div className="rounded-2xl border border-(--quaternary-color)/20 bg-(--bg-primary)/60 p-5">
              <h3 className="font-montserrat text-base font-semibold text-(--text-primary)">
                Ainda não há relatório para este escopo
              </h3>
              <p className="mt-2 text-sm text-(--text-secondary)">
                Use os controles no topo para analisar feedbacks e gerar o relatório.
              </p>
            </div>
          )}

          {report?.summary && report.summary.trim().length > 0 && (
            <InsightsReportSummarySection summaryText={report.summary} />
          )}

          {report?.recommendations && report.recommendations.length > 0 && (
            <InsightsReportRecommendationsSection
              recommendations={report.recommendations}
            />
          )}

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
