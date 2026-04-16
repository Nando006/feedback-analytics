import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function QrCodeEnterpriseSkeleton() {
  return (
    <div aria-label="QrCode Enterprise skeleton" className="font-work-sans space-y-8 pb-8">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
        <SkeletonBlock className="h-7 w-64" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
        <SkeletonBlock className="mt-5 h-10 w-44" />
      </section>

      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
        <SkeletonBlock className="h-5 w-48" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
          <SkeletonBlock className="h-6 w-52" />
          <SkeletonBlock className="mt-6 h-56 w-full" />
          <SkeletonBlock className="mt-4 h-10 w-full" />
          <SkeletonBlock className="mt-3 h-10 w-full" />
        </section>
        <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
          <SkeletonBlock className="h-6 w-44" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-3 h-4 w-5/6" />
        </section>
      </div>
    </div>
  );
}
