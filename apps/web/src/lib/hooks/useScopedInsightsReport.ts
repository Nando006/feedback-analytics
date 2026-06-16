import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FeedbackAnalysisSummary,
  FeedbackInsightsReport,
} from 'lib/interfaces/domain/feedback.domain';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import {
  ServiceGetFeedbackAnalysis,
  ServiceGetFeedbackInsightsReport,
} from 'src/services/serviceFeedbacks';

type UseScopedInsightsReportOptions = {
  /**
   * Quando `true`, busca também a análise (`ServiceGetFeedbackAnalysis`) e
   * retorna `summary` — usado pela página de relatório para o card de clima.
   * O dashboard não precisa (só resumo + recomendações), então deixa `false`.
   */
  withAnalysis?: boolean;
};

type UseScopedInsightsReportResult = {
  report: FeedbackInsightsReport | null;
  summary: FeedbackAnalysisSummary | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/**
 * Busca o relatório de insights filtrado pelo escopo selecionado no header
 * (`useInsightsControls`). Recarrega ao trocar de escopo e ao concluir uma
 * análise/geração de insights (botões "Analisar"/"Gerar insights" do header).
 *
 * Compartilhado pela página de relatório (`feedbackInsightsReport.tsx`) e pelo
 * dashboard, mantendo o mesmo critério de escopo (Geral = só o QR da empresa).
 */
export function useScopedInsightsReport(
  options: UseScopedInsightsReportOptions = {},
): UseScopedInsightsReportResult {
  const withAnalysis = options.withAnalysis === true;

  const { scope, catalogItemId, isAnalyzingRaw, isRegeneratingInsights } =
    useInsightsControls();

  const wasAnalyzingRawRef = useRef(false);
  const wasRegeneratingRef = useRef(false);

  const [report, setReport] = useState<FeedbackInsightsReport | null>(null);
  const [summary, setSummary] = useState<FeedbackAnalysisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const scopeParam = scope;
    const catalogParam =
      scopeParam !== 'COMPANY' ? catalogItemId || undefined : undefined;

    try {
      const [reportData, analysisData] = await Promise.all([
        ServiceGetFeedbackInsightsReport({
          scope_type: scopeParam,
          catalog_item_id: catalogParam,
        }).catch(() => null),
        withAnalysis
          ? ServiceGetFeedbackAnalysis({
              scope_type: scopeParam,
              catalog_item_id: catalogParam,
            }).catch(() => null)
          : Promise.resolve(null),
      ]);

      setReport(reportData);
      setSummary(analysisData?.summary ?? null);

      if (reportData === null && (!withAnalysis || analysisData === null)) {
        setError('Erro ao carregar relatório de insights');
      }
    } catch {
      setError('Erro ao carregar relatório de insights');
    } finally {
      setLoading(false);
    }
  }, [scope, catalogItemId, withAnalysis]);

  // Recarrega ao montar e ao trocar escopo/item.
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Recarrega quando a análise bruta conclui (transição true -> false).
  useEffect(() => {
    if (isAnalyzingRaw) {
      wasAnalyzingRawRef.current = true;
      return;
    }
    if (!wasAnalyzingRawRef.current) return;
    wasAnalyzingRawRef.current = false;
    fetchReportData();
  }, [isAnalyzingRaw, fetchReportData]);

  // Recarrega quando a geração de insights conclui (transição true -> false).
  useEffect(() => {
    if (isRegeneratingInsights) {
      wasRegeneratingRef.current = true;
      return;
    }
    if (!wasRegeneratingRef.current) return;
    wasRegeneratingRef.current = false;
    fetchReportData();
  }, [isRegeneratingInsights, fetchReportData]);

  return { report, summary, loading, error, reload: fetchReportData };
}
