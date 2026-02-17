interface PropsAnalyticsPositiveErrorState {
  error: string;
}

export default function AnalyticsPositiveErrorState({
  error,
}: PropsAnalyticsPositiveErrorState) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
