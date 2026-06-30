import { useCallback, useEffect, useRef, useState } from "react";
import { useInsightsControls } from "src/lib/context/insightsControls";
import { ServiceGetFeedbackStats } from "src/services/serviceFeedbacks";

/**
 * Contagem de feedbacks ainda NÃO analisados no escopo selecionado, lida do
 * endpoint de stats (campo `pendingCount`). Só busca quando `enabled` (a barra
 * de insights só existe em Dashboard/Insights). Recarrega ao trocar de escopo e
 * após concluir uma análise (isAnalyzingRaw true→false).
 */
export function useScopedPendingCount(enabled: boolean): {
  pendingCount: number;
  totalFeedbacks: number;
  totalAnalyzed: number;
  latestAnalysisAt: string | null;
  loading: boolean;
} {
  const { scope, catalogItemId, isAnalyzingRaw, startDate, endDate } = useInsightsControls();

  const wasAnalyzingRef = useRef(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [latestAnalysisAt, setLatestAnalysisAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(async () => {
    setLoading(true);
    // Zera os contadores do escopo anterior antes de aguardar a nova resposta:
    // assim nenhum consumidor (ex.: gate de "Analisar feedbacks") avalia regras
    // contra números defasados durante a troca de escopo.
    setPendingCount(0);
    setTotalFeedbacks(0);
    setTotalAnalyzed(0);
    setLatestAnalysisAt(null);

    const catalogParam =
      scope !== "COMPANY" ? catalogItemId || undefined : undefined;

    try {
      const stats = await ServiceGetFeedbackStats({
        scope_type: scope,
        catalog_item_id: catalogParam,
        start_date: startDate,
        end_date: endDate,
      });
      setPendingCount(stats?.pendingCount ?? 0);
      setTotalFeedbacks(stats?.totalFeedbacks ?? 0);
      setTotalAnalyzed(stats?.totalAnalyzed ?? 0);
      setLatestAnalysisAt(stats?.latestAnalysisAt ?? null);
    } catch {
      setPendingCount(0);
      setTotalFeedbacks(0);
      setTotalAnalyzed(0);
      setLatestAnalysisAt(null);
    } finally {
      setLoading(false);
    }
  }, [scope, catalogItemId, startDate, endDate]);

  useEffect(() => {
    if (enabled) fetchCount();
  }, [enabled, fetchCount]);

  useEffect(() => {
    if (isAnalyzingRaw) {
      wasAnalyzingRef.current = true;
      return;
    }
    if (!wasAnalyzingRef.current) return;
    wasAnalyzingRef.current = false;
    if (enabled) fetchCount();
  }, [isAnalyzingRaw, enabled, fetchCount]);

  return { pendingCount, totalFeedbacks, totalAnalyzed, latestAnalysisAt, loading };
}
