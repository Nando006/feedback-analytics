import type { FeedbackHeaderProps } from './ui.types';

export default function FeedbackHeader({ stats }: FeedbackHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 md:p-8 glass-card">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
            Feedbacks
          </h1>
          {stats && (
            <div className="mt-2 text-sm text-[var(--text-tertiary)]">
              Total: {stats.totalFeedbacks} feedbacks | Média:{' '}
              {stats.averageRating}/5
            </div>
          )}
        </div>

        {stats && (
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-300">
                {stats.sentimentBreakdown.positive}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Positivos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-300">
                {stats.sentimentBreakdown.neutral}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Neutros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-300">
                {stats.sentimentBreakdown.negative}
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Negativos</div>
            </div>
          </div>
        )}
      </div>
      <div className="gradient-banner" />
    </div>
  );
}
