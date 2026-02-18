import type { AnalyticsNegativeErrorStateProps } from './ui.types';

export default function AnalyticsNegativeErrorState({
  error,
}: AnalyticsNegativeErrorStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
