import type { ReactNode } from 'react';

export default function CardSimple({
  children,
  type = 'default',
  disableGlass = false,
}: {
  children: ReactNode;
  type?: 'header' | 'default';
  disableGlass?: boolean;
}) {
  const baseClass = disableGlass
    ? 'relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 md:p-8'
    : 'relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 md:p-8 glass-card';

  switch (type) {
    case 'header':
      return (
        <section className={baseClass}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {children}
          </div>
          {!disableGlass && <div className="gradient-banner" />}
        </section>
      );

    default:
      return (
        <section className={baseClass}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {children}
          </div>
        </section>
      );
  }
}
