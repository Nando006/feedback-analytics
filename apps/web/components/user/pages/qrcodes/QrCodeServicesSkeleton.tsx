import SkeletonBlock from 'components/user/shared/skeletons/SkeletonBlock';

export default function QrCodeServicesSkeleton() {
  return (
    <div aria-label="QrCode Services skeleton" className="font-work-sans space-y-6 pb-8">
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
        <SkeletonBlock className="h-7 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
      </section>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`qrcode-services-skeleton-${index}`} className="rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-5">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="mt-4 h-44 w-full" />
            <SkeletonBlock className="mt-4 h-10 w-full" />
          </article>
        ))}
      </section>
    </div>
  );
}
