import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function FeedbacksAnalyticsNegativeSkeleton() {
  return (
    <div aria-label="Feedbacks Analytics Negative skeleton" className="font-work-sans space-y-6">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-7 w-64" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`analytics-negative-summary-${index}`} className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-4">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-3 h-7 w-16" />
          </div>
        ))}
      </section>
      <section className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`analytics-negative-item-${index}`} className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
          </div>
        ))}
      </section>
    </div>
  );
}
