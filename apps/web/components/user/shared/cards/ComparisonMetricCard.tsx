import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa6';
import type { ComparisonMetricCardProps } from 'components/user/pages/dashboard/ui.types';

export default function ComparisonMetricCard({
  title,
  value,
  refValue,
  delta,
  invertColor = false,
  isPercentageDelta = false,
  icon: Icon,
  helper,
}: ComparisonMetricCardProps) {
  const diff = isPercentageDelta && delta.percentage !== undefined ? delta.percentage : delta.absolute;
  
  // Se o diff for nulo (ex: divisão por zero), tratamos como sem dados anteriores
  const hasReference = delta.percentage !== null;

  // Lógica de cores baseada em invertColor (ex: menor é melhor para críticas)
  const isPositiveChange = diff > 0;
  const isNeutralChange = diff === 0;

  let deltaColorClass = 'text-(--text-secondary) bg-(--quaternary-color)/10';
  let DeltaIcon = FaMinus;

  if (hasReference && !isNeutralChange) {
    const isGood = invertColor ? !isPositiveChange : isPositiveChange;
    if (isGood) {
      deltaColorClass = 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/15';
      DeltaIcon = FaArrowUp;
    } else {
      deltaColorClass = 'text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/15';
      DeltaIcon = FaArrowDown;
    }
  }

  const formattedDelta = (() => {
    if (!hasReference) return 'Novo';
    if (isNeutralChange) return '0%';
    
    const sign = isPositiveChange ? '+' : '';
    const unit = isPercentageDelta ? '%' : '';
    return `${sign}${diff.toFixed(1)}${unit}`;
  })();

  return (
    <div className="font-work-sans rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-montserrat text-sm text-(--text-tertiary)">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-(--text-primary)">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color) text-(--text-secondary)">
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-(--quaternary-color)/6 pt-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-(--text-tertiary)">
            Período ant.
          </span>
          <span className="text-sm font-medium text-(--text-secondary)">
            {refValue}
          </span>
        </div>

        <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${deltaColorClass}`}>
          {hasReference && !isNeutralChange && <DeltaIcon className="h-3 w-3" />}
          <span>{formattedDelta}</span>
        </div>
      </div>

      {helper ? (
        <p className="mt-3 text-xs text-(--text-tertiary)">{helper}</p>
      ) : null}
    </div>
  );
}
