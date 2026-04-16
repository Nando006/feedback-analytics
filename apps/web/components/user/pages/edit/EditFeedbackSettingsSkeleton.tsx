import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function EditFeedbackSettingsSkeleton() {
  return (
    <div aria-label="Edit Feedback Settings skeleton" className="font-work-sans space-y-6 pb-8">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-7 w-72" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
        <div className="mt-4 flex gap-3">
          <SkeletonBlock className="h-10 w-40" />
          <SkeletonBlock className="h-10 w-32" />
        </div>
      </section>
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
        <SkeletonBlock className="h-6 w-64" />
        <SkeletonBlock className="mt-4 h-10 w-full" />
        <SkeletonBlock className="mt-3 h-10 w-full" />
        <SkeletonBlock className="mt-3 h-10 w-full" />
      </section>
    </div>
  );
}
