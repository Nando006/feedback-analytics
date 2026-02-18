import type { AnalyticsPositiveErrorStateProps } from './ui.types';

export default function AnalyticsPositiveErrorState({
  error,
}: AnalyticsPositiveErrorStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
