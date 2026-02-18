import type { FeedbacksAllErrorStateProps } from './ui.types';

export default function FeedbacksAllErrorState({
  error,
}: FeedbacksAllErrorStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
