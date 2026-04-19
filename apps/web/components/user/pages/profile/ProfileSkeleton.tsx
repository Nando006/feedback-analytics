import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function ProfileSkeleton() {
  return (
    <div aria-label="Profile skeleton" className="font-work-sans space-y-6">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-4/5" />
          <SkeletonBlock className="mt-6 h-10 w-full" />
        </div>
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-3/4" />
          <SkeletonBlock className="mt-6 h-10 w-full" />
        </div>
      </section>
    </div>
  );
}
