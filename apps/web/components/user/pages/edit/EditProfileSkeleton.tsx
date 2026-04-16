import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function EditProfileSkeleton() {
  return (
    <div aria-label="Edit Profile skeleton" className="font-work-sans space-y-8 pb-12">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-7 w-44" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
      </section>

      <section className="space-y-6 px-4">
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="mt-4 h-10 w-full" />
          <SkeletonBlock className="mt-3 h-10 w-full" />
        </div>
        <div className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="mt-4 h-10 w-full" />
          <SkeletonBlock className="mt-3 h-10 w-full" />
        </div>
      </section>
    </div>
  );
}
