import type { InsightsReportErrorStateProps } from './ui.types';

export default function InsightsReportErrorState({
  error,
  variant = 'error',
}: InsightsReportErrorStateProps) {
  const containerClassName =
    variant === 'warning'
      ? 'w-full max-w-xl rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center text-amber-100 font-work-sans'
      : 'w-full max-w-xl rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-200 font-work-sans';

  return (
    <div className="flex h-64 items-center justify-center">
      <div className={containerClassName}>
        {error}
      </div>
    </div>
  );
}
