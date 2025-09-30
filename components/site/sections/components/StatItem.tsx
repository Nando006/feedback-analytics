import type { IStatItemProps } from 'lib/interfaces/site/section.ts';

export default function StatItem({
  value,
  label,
  gradientFrom,
  gradientTo,
}: IStatItemProps) {
  return (
    <div className="text-center">
      <div
        className="text-2xl font-bold bg-clip-text text-transparent"
        style={{
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
          WebkitBackgroundClip: 'text',
        }}>
        {value}
      </div>
      <div className="text-sm text-[var(--color-text-muted)]">{label}</div>
    </div>
  );
}