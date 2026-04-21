import { useEffect, useRef, useState } from 'react';
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from 'react-router-dom';
import type { FeedbackAnalysisSummary } from 'lib/interfaces/domain/feedback.domain';
import type { LoaderFeedbacksInsightsReport } from 'src/routes/loaders/loaderFeedbacksInsightsReport';
import { useInsightsControls } from 'src/lib/context/insightsControls';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    report,
    summary,
    error: loaderError,
    filters,
    analysisGuard,
    availableScopes,
    catalogItemOptions,
  } = useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsReport>>>();

  const {
    scope,
    setScope,
    catalogItemId,
    setCatalogItemId,
    setCatalogItemOptions,
    setAvailableScopes,
    setCanAnalyze,
    isAnalyzingRaw,
    isRegeneratingInsights,
  } = useInsightsControls();

  const revalidator = useRevalidator();
  const mountedRef = useRef(false);
  const wasAnalyzingRawRef = useRef(false);
  const wasRegeneratingRef = useRef(false);
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  const refreshing = isRegeneratingInsights || revalidator.state === 'loading';
  const errorKey = loaderError ? `loader:${loaderError}` : null;
  const showErrorPopup = Boolean(errorKey && dismissedErrorKey !== errorKey);

  // Alimenta o contexto com dados do loader (catálogo, escopos, permissão)
  useEffect(() => {
    setCatalogItemOptions(catalogItemOptions);
    setAvailableScopes(availableScopes);
    setCanAnalyze(analysisGuard.canAnalyze);
  }, [
    catalogItemOptions,
    availableScopes,
    analysisGuard.canAnalyze,
    setCatalogItemOptions,
    setAvailableScopes,
    setCanAnalyze,
  ]);

  // Mount: URL ganha — sincroniza contexto a partir dos params da URL
  useEffect(() => {
    setScope(filters.scope_type as 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT');
    setCatalogItemId(filters.catalog_item_id ?? '');
    mountedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scope do contexto → URL (só após o mount para evitar override imediato)
  useEffect(() => {
    if (!mountedRef.current) return;
    if (scope === filters.scope_type) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('scope_type', scope);

    if (scope === 'COMPANY') {
      nextParams.delete('catalog_item_id');
    } else {
      const first = catalogItemOptions.find((item) => item.kind === scope);
      if (first) nextParams.set('catalog_item_id', first.id);
      else nextParams.delete('catalog_item_id');
    }

    setSearchParams(nextParams);
  }, [scope, filters.scope_type, catalogItemOptions, searchParams, setSearchParams]);

  // CatalogItemId do contexto → URL
  useEffect(() => {
    if (!mountedRef.current) return;
    const current = filters.catalog_item_id ?? '';
    if (catalogItemId === current) return;

    const nextParams = new URLSearchParams(searchParams);
    if (catalogItemId) {
      nextParams.set('catalog_item_id', catalogItemId);
    } else {
      nextParams.delete('catalog_item_id');
    }
    setSearchParams(nextParams, { replace: true });
  }, [catalogItemId, filters.catalog_item_id, searchParams, setSearchParams]);

  // Auto-seleciona o primeiro item válido quando o selecionado não existe no escopo
  useEffect(() => {
    if (filters.scope_type === 'COMPANY') return;

    const scopeItems = catalogItemOptions.filter((item) => item.kind === filters.scope_type);
    const hasSelectedItem =
      Boolean(filters.catalog_item_id) &&
      scopeItems.some((item) => item.id === filters.catalog_item_id);

    if (hasSelectedItem || scopeItems.length === 0) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('catalog_item_id', scopeItems[0].id);
    setSearchParams(nextParams, { replace: true });
  }, [filters.scope_type, filters.catalog_item_id, catalogItemOptions, searchParams, setSearchParams]);

  // Revalida quando análise bruta conclui
  useEffect(() => {
    if (isAnalyzingRaw) { wasAnalyzingRawRef.current = true; return; }
    if (!wasAnalyzingRawRef.current) return;
    wasAnalyzingRawRef.current = false;
    revalidator.revalidate();
  }, [isAnalyzingRaw, revalidator]);

  // Revalida quando geração de insights conclui
  useEffect(() => {
    if (isRegeneratingInsights) { wasRegeneratingRef.current = true; return; }
    if (!wasRegeneratingRef.current) return;
    wasRegeneratingRef.current = false;
    revalidator.revalidate();
  }, [isRegeneratingInsights, revalidator]);

  if (refreshing && !report && !summary && !loaderError) {
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
            canAnalyze={analysisGuard.canAnalyze}
            analysisBlockedMessage={analysisGuard.message}
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

      {showErrorPopup && loaderError && (
        <InsightsReportErrorState
          error={loaderError}
          variant="error"
          onClose={() => setDismissedErrorKey(errorKey)}
        />
      )}
    </>
  );
}
