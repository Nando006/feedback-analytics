import type { AnalyticsAllErrorStateProps } from './ui.types';

export default function AnalyticsAllErrorState({
  error,
}: AnalyticsAllErrorStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
