import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function InsightsStatisticsSkeleton() {
  return (
    <div aria-label="Insights Statistics skeleton" className="font-work-sans space-y-6">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="mt-4 h-24 w-full" />
      </section>
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
        <SkeletonBlock className="h-5 w-52" />
        <SkeletonBlock className="mt-4 h-40 w-full" />
      </section>
    </div>
  );
}
