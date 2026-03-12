import type { MetricCardProps } from './ui.types';

export default function MetricCard({ title, value, helper, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-montserrat text-sm text-(--text-tertiary)">{title}</p>
          <p className="font-work-sans mt-3 text-3xl font-semibold text-(--text-primary)">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) text-(--text-secondary)">
          <Icon size={20} />
        </div>
      </div>
      {helper ? (
        <p className="font-work-sans mt-3 text-xs text-(--text-tertiary)">{helper}</p>
      ) : null}
    </div>
  );
}