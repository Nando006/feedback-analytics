import { useEffect, useRef, useState } from 'react';
import {
  useFetcher,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from 'react-router-dom';
import { useToast } from 'components/public/forms/messages/useToast';
import type {
  FeedbackAnalysisSummary,
} from 'lib/interfaces/domain/feedback.domain';
import type { LoaderFeedbacksInsightsReport } from 'src/routes/loaders/loaderFeedbacksInsightsReport';
import { INTENT_FEEDBACK_RUN_IA } from 'src/lib/constants/routes/intents';
import InsightsReportLoadingState from 'components/user/pages/feedbacksInsightsReport/InsightsReportLoadingState';
import InsightsReportErrorState from 'components/user/pages/feedbacksInsightsReport/InsightsReportErrorState';
import InsightsReportHeaderSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportHeaderSection';
import InsightsReportMoodSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportMoodSection';
import InsightsReportSummarySection from 'components/user/pages/feedbacksInsightsReport/InsightsReportSummarySection';
import InsightsReportRecommendationsSection from 'components/user/pages/feedbacksInsightsReport/InsightsReportRecommendationsSection';
import type { FeedbackInsightsReportActionData } from './ui.types';
import type { InsightScopeOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';

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
  const toast = useToast();
  const {
    report,
    summary,
    error: loaderError,
    filters,
    analysisGuard,
    availableScopes,
    catalogItemOptions,
  } =
    useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksInsightsReport>>>();
  const revalidator = useRevalidator();
  const fetcher = useFetcher<FeedbackInsightsReportActionData>();
  const shouldRevalidateRef = useRef(false);
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);
  const [localError, setLocalError] = useState<{
    error: string;
    errorCode:
      | 'item_selection_required'
      | 'collecting_data_required_for_analysis';
  } | null>(null);

  const refreshing =
    fetcher.state !== 'idle' || revalidator.state === 'loading';
  const error = localError?.error ?? fetcher.data?.error ?? loaderError;
  const errorCode = localError?.errorCode ?? fetcher.data?.errorCode;
  const errorVariant =
    errorCode === 'insufficient_feedbacks_for_analysis' ||
      errorCode === 'collecting_data_required_for_analysis' ||
      errorCode === 'item_selection_required'
      ? 'warning'
      : 'error';
  const errorKey = error
    ? `${errorCode ?? 'generic'}:${error}`
    : null;
  const showErrorPopup = Boolean(errorKey && dismissedErrorKey !== errorKey);

  useEffect(() => {
    if (filters.scope_type === 'COMPANY') {
      return;
    }

    const scopeItems = catalogItemOptions.filter((item) => item.kind === filters.scope_type);
    const hasSelectedItem =
      Boolean(filters.catalog_item_id) &&
      scopeItems.some((item) => item.id === filters.catalog_item_id);

    if (hasSelectedItem || scopeItems.length === 0) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('catalog_item_id', scopeItems[0].id);
    setSearchParams(nextParams, { replace: true });
  }, [
    filters.scope_type,
    filters.catalog_item_id,
    catalogItemOptions,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    const finishedRequest = fetcher.state === 'idle' && shouldRevalidateRef.current;

    if (!finishedRequest) {
      return;
    }

    shouldRevalidateRef.current = false;

    if (fetcher.data?.ok) {
      toast.success('Análise concluída!', 'Relatório atualizado com insights da IA');
      revalidator.revalidate();
    } else if (fetcher.data?.error) {
      toast.error('Erro na análise', fetcher.data.error);
    }
  }, [fetcher.state, fetcher.data?.ok, fetcher.data?.error, revalidator, toast]);

  const handleRefreshSelected = () => {
    if (!analysisGuard.canAnalyze) {
      setLocalError({
        error:
          analysisGuard.message ??
          'Preencha as informações da empresa para liberar a análise.',
        errorCode: 'collecting_data_required_for_analysis',
      });
      setDismissedErrorKey(null);
      return;
    }

    if (filters.scope_type !== 'COMPANY' && !filters.catalog_item_id) {
      setLocalError({
        error: 'Selecione um item para analisar este escopo.',
        errorCode: 'item_selection_required',
      });
      setDismissedErrorKey(null);
      return;
    }

    const form = new FormData();
    form.set('intent', INTENT_FEEDBACK_RUN_IA);
    form.set('scope_type', filters.scope_type);

    if (filters.catalog_item_id) {
      form.set('catalog_item_id', filters.catalog_item_id);
    }

    setLocalError(null);
    setDismissedErrorKey(null);
    shouldRevalidateRef.current = true;
    
    // Toast de loading para análises longas
    toast.success('Gerando análise...', 'Isso pode levar alguns momentos');
    
    fetcher.submit(form, { method: 'post' });
  };

  const handleScopeChange = (scope: InsightScopeOption) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('scope_type', scope);

    if (scope === 'COMPANY') {
      nextParams.delete('catalog_item_id');
    } else {
      const scopeItems = catalogItemOptions.filter((item) => item.kind === scope);

      if (scopeItems.length > 0) {
        nextParams.set('catalog_item_id', scopeItems[0].id);
      } else {
        nextParams.delete('catalog_item_id');
      }
    }

    setLocalError(null);
    setDismissedErrorKey(null);
    setSearchParams(nextParams);
  };

  const handleCatalogItemChange = (catalogItemId: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (catalogItemId) {
      nextParams.set('catalog_item_id', catalogItemId);
    } else {
      nextParams.delete('catalog_item_id');
    }

    setLocalError(null);
    setDismissedErrorKey(null);
    setSearchParams(nextParams);
  };

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
            refreshing={refreshing}
            canAnalyze={analysisGuard.canAnalyze}
            analysisBlockedMessage={analysisGuard.message}
            availableScopes={availableScopes}
            selectedScope={filters.scope_type}
            selectedCatalogItemId={filters.catalog_item_id ?? ''}
            catalogItemOptions={catalogItemOptions}
            onScopeChange={handleScopeChange}
            onCatalogItemChange={handleCatalogItemChange}
            onRefreshSelected={handleRefreshSelected}
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
                Selecione outro escopo no filtro acima ou clique em
                {' '}
                <span className="font-semibold text-(--text-primary)">Atualizar escopo selecionado</span>
                {' '}
                para gerar um novo relatório.
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

      {showErrorPopup && error && (
        <InsightsReportErrorState
          error={error}
          variant={errorVariant}
          onClose={() => {
            if (localError) {
              setLocalError(null);
            }

            setDismissedErrorKey(errorKey);
          }}
        />
      )}
    </>
  );
}
