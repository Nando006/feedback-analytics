import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FeedbackAnalysisItem,
  FeedbackAnalysisSummary,
} from "lib/interfaces/domain/feedback.domain";
import type { FeedbackAnalysisLoadData } from "src/routes/load/loadFeedbackAnalysis";
import { useInsightsControls } from "src/lib/context/insightsControls";
import { ServiceGetFeedbackAnalysis } from "src/services/serviceFeedbacks";

type UseScopedFeedbackAnalysisResult = {
  items: FeedbackAnalysisItem[];
  summary: FeedbackAnalysisSummary | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/**
 * Análise de feedbacks (resumo + itens) filtrada pelo escopo selecionado em
 * `useInsightsControls`. Semeia o estado com os dados do loader (escopo Empresa)
 * e recarrega ao trocar de escopo/item e ao concluir uma análise/geração de
 * insights — mesma mecânica de `useScopedInsightsReport`, mas só para a análise.
 *
 * Pula o primeiro fetch quando o escopo ainda é o do loader (Empresa, sem item),
 * aproveitando a semente e mantendo o skeleton de rota.
 */
export function useScopedFeedbackAnalysis(
  initialData: FeedbackAnalysisLoadData,
): UseScopedFeedbackAnalysisResult {
  const { scope, catalogItemId, isAnalyzingRaw, isRegeneratingInsights } =
    useInsightsControls();

  const didInitRef = useRef(false);
  const wasAnalyzingRawRef = useRef(false);
  const wasRegeneratingRef = useRef(false);

  const [items, setItems] = useState<FeedbackAnalysisItem[]>(initialData.items);
  const [summary, setSummary] = useState<FeedbackAnalysisSummary | null>(
    initialData.summary,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialData.error);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    const catalogParam =
      scope !== "COMPANY" ? catalogItemId || undefined : undefined;

    try {
      const data = await ServiceGetFeedbackAnalysis({
        scope_type: scope,
        catalog_item_id: catalogParam,
      });
      setItems(data.items);
      setSummary(data.summary);
    } catch {
      setItems([]);
      setSummary(null);
      setError("Erro ao carregar analytics de feedbacks");
    } finally {
      setLoading(false);
    }
  }, [scope, catalogItemId]);

  // Recarrega ao trocar escopo/item; no 1º render usa a semente do loader
  // quando o escopo ainda é Empresa (sem item).
  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      if (scope === "COMPANY" && !catalogItemId) {
        return;
      }
    }
    fetchAnalysis();
  }, [fetchAnalysis, scope, catalogItemId]);

  // Recarrega quando a análise bruta conclui (true -> false).
  useEffect(() => {
    if (isAnalyzingRaw) {
      wasAnalyzingRawRef.current = true;
      return;
    }
    if (!wasAnalyzingRawRef.current) return;
    wasAnalyzingRawRef.current = false;
    fetchAnalysis();
  }, [isAnalyzingRaw, fetchAnalysis]);

  // Recarrega quando a geração de insights conclui (true -> false).
  useEffect(() => {
    if (isRegeneratingInsights) {
      wasRegeneratingRef.current = true;
      return;
    }
    if (!wasRegeneratingRef.current) return;
    wasRegeneratingRef.current = false;
    fetchAnalysis();
  }, [isRegeneratingInsights, fetchAnalysis]);

  return { items, summary, loading, error, reload: fetchAnalysis };
}
