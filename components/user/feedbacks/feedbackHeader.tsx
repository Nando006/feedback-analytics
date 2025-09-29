import type { FeedbackStats } from 'lib/interfaces/user/feedback';

interface FeedbackHeaderProps {
  stats: FeedbackStats | null;
}

export default function FeedbackHeader({ stats }: FeedbackHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 md:p-8 glass-card">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            Feedbacks
          </h1>
          {stats && (
            <div className="mt-2 text-sm text-[var(--text-muted)]">
              Total: {stats.totalFeedbacks} feedbacks | Média:{' '}
              {stats.averageRating}/5
            </div>
          )}
        </div>

        {stats && (
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {stats.sentimentBreakdown.positive}
              </div>
              <div className="text-xs text-[var(--text-muted)]">Positivos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {stats.sentimentBreakdown.neutral}
              </div>
              <div className="text-xs text-[var(--text-muted)]">Neutros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {stats.sentimentBreakdown.negative}
              </div>
              <div className="text-xs text-[var(--text-muted)]">Negativos</div>
            </div>
          </div>
        )}
      </div>
      <div className="gradient-banner" />
    </div>
  );
}
