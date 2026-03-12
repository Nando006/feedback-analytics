import type { AnalyticsPositiveErrorStateProps } from './ui.types';

export default function AnalyticsPositiveErrorState({
  error,
}: AnalyticsPositiveErrorStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-200 font-work-sans">
        {error}
      </div>
    </div>
  );
}
