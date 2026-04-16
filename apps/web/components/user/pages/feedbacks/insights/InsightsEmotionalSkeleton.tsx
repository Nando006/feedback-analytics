import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function InsightsEmotionalSkeleton() {
  return (
    <div aria-label="Insights Emotional skeleton" className="font-work-sans space-y-6">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="mt-4 h-24 w-full" />
      </section>
      <section className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={`insights-emotional-${index}`} className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
            <SkeletonBlock className="h-5 w-44" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-5/6" />
          </div>
        ))}
      </section>
    </div>
  );
}
