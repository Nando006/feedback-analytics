interface PropsFeedbacksAllErrorState {
  error: string;
}

export default function FeedbacksAllErrorState({
  error,
}: PropsFeedbacksAllErrorState) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-400">{error}</div>
    </div>
  );
}
