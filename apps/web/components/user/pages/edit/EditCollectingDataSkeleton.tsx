import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function EditCollectingDataSkeleton() {
  return (
    <div aria-label="Edit Collecting Data skeleton" className="font-work-sans space-y-6 pb-8">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-6 w-64" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
      </section>
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
        <SkeletonBlock className="h-5 w-72" />
        <SkeletonBlock className="mt-4 h-10 w-44" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={`edit-collecting-${index}`} className="h-10 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
