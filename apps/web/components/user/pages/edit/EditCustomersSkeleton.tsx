import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function EditCustomersSkeleton() {
  return (
    <div aria-label="Edit Customers skeleton" className="font-work-sans space-y-6 pb-8">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-6 w-36" />
        <SkeletonBlock className="mt-3 h-4 w-3/4" />
      </section>
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-5 w-72" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
      </section>
    </div>
  );
}
