import InsightsReportSummarySection from './InsightsReportSummarySection';
import InsightsReportRecommendationsSection from './InsightsReportRecommendationsSection';
import type { InsightsReportContentProps } from './ui.types';

/**
 * Conteúdo do relatório de insights (resumo + recomendações), com estado vazio.
 * Apresentacional — sem lógica de busca. Reutilizado pela página de relatório
 * e pelo bloco de relatório do dashboard.
 */
export default function InsightsReportContent({ report }: InsightsReportContentProps) {
  const hasContent =
    report &&
    ((report.summary && report.summary.trim().length > 0) ||
      (report.recommendations && report.recommendations.length > 0));

  if (!hasContent) {
    return (
      <div className="rounded-2xl border border-(--quaternary-color)/20 bg-(--bg-primary)/60 p-5">
        <h3 className="font-montserrat text-base font-semibold text-(--text-primary)">
          Ainda não há relatório para este escopo
        </h3>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Use os controles no topo para analisar feedbacks e gerar o relatório.
        </p>
      </div>
    );
  }

  return (
    <>
      {report?.summary && report.summary.trim().length > 0 && (
        <InsightsReportSummarySection summaryText={report.summary} />
      )}

      {report?.recommendations && report.recommendations.length > 0 && (
        <InsightsReportRecommendationsSection
          recommendations={report.recommendations}
        />
      )}
    </>
  );
}
