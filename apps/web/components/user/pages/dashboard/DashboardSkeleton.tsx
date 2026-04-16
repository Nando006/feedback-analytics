function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-(--seventh-color) ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <div
      aria-label="Dashboard skeleton"
      className="font-work-sans space-y-6"
    >
      <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-9 w-72 max-w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-4/5" />
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SkeletonBlock className="h-11 w-36" />
          <SkeletonBlock className="h-5 w-52" />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`dashboard-metric-skeleton-${index}`}
            className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5"
          >
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="mt-3 h-8 w-20" />
            <SkeletonBlock className="mt-2 h-3 w-40" />
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
            <SkeletonBlock className="h-6 w-52" />
            <SkeletonBlock className="mt-2 h-4 w-72 max-w-full" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`dashboard-distribution-skeleton-${index}`}
                  className="flex items-center gap-3"
                >
                  <SkeletonBlock className="h-4 w-10" />
                  <SkeletonBlock className="h-2 w-full" />
                  <SkeletonBlock className="h-4 w-12" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
            <SkeletonBlock className="h-6 w-44" />
            <SkeletonBlock className="mt-2 h-4 w-64 max-w-full" />

            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`dashboard-feedback-skeleton-${index}`}
                  className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) p-4"
                >
                  <div className="flex gap-2">
                    <SkeletonBlock className="h-5 w-16" />
                    <SkeletonBlock className="h-5 w-20" />
                    <SkeletonBlock className="h-5 w-24" />
                  </div>
                  <SkeletonBlock className="mt-3 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-4/5" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
            <SkeletonBlock className="h-6 w-44" />
            <div className="mt-6 space-y-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`dashboard-strategy-skeleton-${index}`}>
                  <SkeletonBlock className="h-3 w-28" />
                  <SkeletonBlock className="mt-2 h-4 w-full" />
                  <SkeletonBlock className="mt-2 h-4 w-3/4" />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
            <SkeletonBlock className="h-6 w-40" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`dashboard-radar-skeleton-${index}`}
                  className="rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) px-4 py-3"
                >
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="mt-2 h-5 w-14" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
