import type { AnalyticsNegativeErrorStateProps } from './ui.types';

export default function AnalyticsNegativeErrorState({
  error,
}: AnalyticsNegativeErrorStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-200">
        {error}
      </div>
    </div>
  );
}
