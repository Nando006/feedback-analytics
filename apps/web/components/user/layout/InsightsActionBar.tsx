import { useLocation } from "react-router-dom";
import { FaChartLine, FaRegBell, FaWandMagicSparkles } from "react-icons/fa6";
import { useInsightsControls } from "src/lib/context/insightsControls";
import { isMatch } from "src/lib/utils/navMatch";
import { useScopedPendingCount } from "src/lib/hooks/useScopedPendingCount";
import { useScopedInsightsReport } from "src/lib/hooks/useScopedInsightsReport";
import InsightsControlsBar from "components/user/pages/feedbacksInsightsReport/InsightsControlsBar";

// Mínimo de feedbacks no escopo para rodar a análise
// (espelha MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS no backend).
const MIN_FEEDBACKS_TO_ANALYZE = 10;

/**
 * Barra de controles de Insights no layout (abaixo do header): seletor de
 * escopo + contador de feedbacks novos + Analisar/Gerar. Aparece só em
 * Dashboard e Insights; em outras telas retorna null.
 */
export default function InsightsActionBar() {
  const { pathname } = useLocation();
  const isScopeRoute =
    isMatch("/user/dashboard", pathname) || isMatch("/user/insights", pathname);

  const {
    scope,
    catalogItemId,
    canAnalyze,
    analyzeRaw,
    regenerateInsights,
    isAnalyzingRaw,
    isRegeneratingInsights,
  } = useInsightsControls();
  const { pendingCount, totalFeedbacks, totalAnalyzed, latestAnalysisAt, loading } =
    useScopedPendingCount(isScopeRoute);
  const { report } = useScopedInsightsReport();

  if (!isScopeRoute) return null;

  const missingItem = scope !== "COMPANY" && !catalogItemId;
  const isProcessing = isAnalyzingRaw || isRegeneratingInsights;
  const belowMinimum = totalFeedbacks < MIN_FEEDBACKS_TO_ANALYZE;
  const nothingNew = pendingCount === 0;
  // `loading`: enquanto as métricas do escopo recém-selecionado ainda estão em
  // voo, totalFeedbacks/pendingCount ainda refletem o escopo ANTERIOR. Travar as
  // ações nesse intervalo evita habilitar "Analisar"/"Gerar" com base em números
  // defasados — o que deixava o botão clicável abaixo do mínimo real do novo
  // escopo (ex.: Empresa com menos de 10 feedbacks).
  const baseDisabled = loading || isProcessing || missingItem || !canAnalyze;
  const analyzeDisabled = baseDisabled || belowMinimum || nothingNew;

  const analyzeBlockedReason = belowMinimum
    ? `Mínimo de ${MIN_FEEDBACKS_TO_ANALYZE} feedbacks no escopo para analisar`
    : nothingNew
      ? "Nenhum feedback novo para analisar"
      : undefined;

  // "Gerar insights": só faz sentido se há feedbacks analisados e se surgiu
  // análise nova desde o último relatório (senão re-rodaria a IA à toa).
  const hasAnalysis = totalAnalyzed > 0;
  const reportTime = report?.updatedAt ? Date.parse(report.updatedAt) : NaN;
  const analysisTime = latestAnalysisAt ? Date.parse(latestAnalysisAt) : NaN;
  const insightsUpToDate =
    !Number.isNaN(reportTime) &&
    !Number.isNaN(analysisTime) &&
    reportTime >= analysisTime;
  const generateDisabled = baseDisabled || !hasAnalysis || insightsUpToDate;

  const generateBlockedReason = !hasAnalysis
    ? "Nenhum feedback analisado para gerar insights"
    : insightsUpToDate
      ? "Relatório já está atualizado — nenhuma análise nova"
      : undefined;

  const notificationLabel =
    pendingCount === 0
      ? "Nenhum feedback novo para analisar"
      : belowMinimum
        ? `${pendingCount} feedback(s) novo(s) · mínimo de ${MIN_FEEDBACKS_TO_ANALYZE} no escopo para analisar`
        : `${pendingCount} feedback(s) novo(s) para analisar`;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-3">
      <InsightsControlsBar />

      <span
        role="status"
        aria-label={notificationLabel}
        title={notificationLabel}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-secondary)"
      >
        <FaRegBell aria-hidden className="h-4 w-4" />
        {pendingCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-(--primary-color) px-1 text-[10px] font-bold text-(--bg-primary)">
            {pendingCount > 99 ? "99+" : pendingCount}
          </span>
        )}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={analyzeRaw}
          disabled={analyzeDisabled}
          title={analyzeBlockedReason}
          className="btn-secondary font-poppins inline-flex items-center gap-1.5 px-3 py-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaWandMagicSparkles aria-hidden className="text-[0.7rem]" />
          {isAnalyzingRaw ? "Analisando..." : "Analisar feedbacks"}
        </button>
        <button
          type="button"
          onClick={regenerateInsights}
          disabled={generateDisabled}
          title={generateBlockedReason}
          className="btn-secondary font-poppins inline-flex items-center gap-1.5 px-3 py-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaChartLine aria-hidden className="text-[0.7rem]" />
          {isRegeneratingInsights ? "Gerando..." : "Gerar insights"}
        </button>
      </div>
    </div>
  );
}
