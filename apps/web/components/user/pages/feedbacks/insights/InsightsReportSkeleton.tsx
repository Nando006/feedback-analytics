import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function InsightsReportSkeleton() {
  return (
    <div aria-label="Insights Report skeleton" className="font-work-sans space-y-6 pb-8">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 space-y-5">
        <div>
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
        </div>
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-24 w-full" />
      </section>
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="mt-4 h-28 w-full" />
      </section>
    </div>
  );
}
