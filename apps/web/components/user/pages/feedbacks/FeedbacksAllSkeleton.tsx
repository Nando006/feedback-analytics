import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function FeedbacksAllSkeleton() {
  return (
    <div aria-label="Feedbacks All skeleton" className="font-work-sans space-y-6 pb-8">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-6">
        <SkeletonBlock className="h-7 w-48" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
      </section>
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="mt-3 h-10 w-full" />
      </section>
      <section className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <article key={`feedbacks-all-skeleton-${index}`} className="rounded-2xl border border-(--quaternary-color)/10 bg-(--bg-secondary) p-5">
            <SkeletonBlock className="h-4 w-44" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-5/6" />
          </article>
        ))}
      </section>
    </div>
  );
}
