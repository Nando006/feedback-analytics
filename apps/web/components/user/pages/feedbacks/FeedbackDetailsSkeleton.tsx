import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function FeedbackDetailsSkeleton() {
  return (
    <div aria-label="Feedback Details skeleton" className="font-work-sans space-y-6 pb-8">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
        <SkeletonBlock className="h-8 w-52" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
        <SkeletonBlock className="mt-2 h-4 w-4/5" />
      </section>
    </div>
  );
}
