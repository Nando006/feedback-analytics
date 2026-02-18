import type { InsightsStatisticsErrorStateProps } from './ui.types';

export default function InsightsStatisticsErrorState({
  error,
}: InsightsStatisticsErrorStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
