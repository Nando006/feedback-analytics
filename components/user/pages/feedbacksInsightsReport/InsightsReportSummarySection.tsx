import type { InsightsReportSummarySectionProps } from './ui.types';

export default function InsightsReportSummarySection({
  summaryText,
}: InsightsReportSummarySectionProps) {
  return (
    <div className="mt-4">
      <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
        Visão geral
      </h3>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-primary)]">
        {summaryText}
      </p>
    </div>
  );
}
