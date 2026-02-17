interface PropsInsightsReportRecommendationsSection {
  recommendations: string[];
}

export default function InsightsReportRecommendationsSection({
  recommendations,
}: PropsInsightsReportRecommendationsSection) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">
        Recomendações da IA
      </h3>
      <ul className="list-inside list-disc space-y-2 text-sm text-[var(--text-primary)]">
        {recommendations.map((rec, index) => (
          <li key={`${index}-${rec.slice(0, 16)}`}>
            <span className="whitespace-pre-wrap leading-relaxed">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
