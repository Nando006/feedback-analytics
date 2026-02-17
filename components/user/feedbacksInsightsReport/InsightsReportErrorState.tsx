interface PropsInsightsReportErrorState {
  error: string;
}

export default function InsightsReportErrorState({
  error,
}: PropsInsightsReportErrorState) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
