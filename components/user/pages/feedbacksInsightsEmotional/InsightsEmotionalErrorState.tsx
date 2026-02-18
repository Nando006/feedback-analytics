import type { InsightsEmotionalErrorStateProps } from './ui.types';

export default function InsightsEmotionalErrorState({
  error,
}: InsightsEmotionalErrorStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
