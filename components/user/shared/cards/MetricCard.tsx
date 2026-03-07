import type { MetricCardProps } from './ui.types';

export default function MetricCard({ title, value, helper, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-neutral-100">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800/70 text-neutral-200">
          <Icon size={20} />
        </div>
      </div>
      {helper ? (
        <p className="mt-3 text-xs text-neutral-500">{helper}</p>
      ) : null}
    </div>
  );
}