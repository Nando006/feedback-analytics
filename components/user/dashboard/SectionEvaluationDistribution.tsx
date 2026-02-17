import { useMemo } from 'react';
import { FaChartLine } from 'react-icons/fa6';
import { FaStar } from 'react-icons/fa';
import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';

type DashboardStats = Awaited<ReturnType<typeof LoaderUserDashboard>>['stats'];

interface PropsEvaluationDistribution {
  stats: DashboardStats | null;
}

export default function SectionEvaluationDistribution({ stats }: PropsEvaluationDistribution) {
  const RATING_ORDER = [5, 4, 3, 2, 1] as const;

  const distribution = useMemo(() => {
    if (!stats)
      return [] as Array<{ rating: number; count: number; percent: number }>;
    const total = stats.totalFeedbacks || 0;
    return RATING_ORDER.map((rating) => {
      const count = stats.ratingDistribution[rating];
      const percent = total ? Math.round((count / total) * 100) : 0;
      return { rating, count, percent };
    });
  }, [stats]);

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[var(--shadow-primary)]">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100">
            Distribuição das avaliações
          </h2>
          <p className="text-sm text-neutral-400">
            Percentual de feedbacks por nota nos últimos registros
          </p>
        </div>
        <FaChartLine className="text-neutral-400" size={20} />
      </header>

      <div className="mt-6 space-y-4">
        {distribution.length === 0 ? (
          <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 p-6 text-center text-sm text-neutral-400">
            Ainda não há avaliações suficientes para compor a distribuição.
          </div>
        ) : (
          distribution.map(({ rating, count, percent }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex w-12 items-center gap-1 text-sm text-neutral-300">
                <FaStar className="text-yellow-400" size={12} />
                <span>{rating}</span>
              </div>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="w-16 text-right text-xs text-neutral-400">
                {percent}% · {count}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
