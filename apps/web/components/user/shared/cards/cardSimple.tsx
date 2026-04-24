import type { CardSimpleProps } from './ui.types';
import { useState } from 'react';

export default function CardSimple({
  children,
  type = 'default',
  title,
  description,
  defaultOpen = false,
}: CardSimpleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const baseClass =
    'relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6 md:p-8 glass-card';

  if (type === 'accordion') {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) glass-card">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-transparent p-6 md:p-8 transition duration-200 hover:border-(--primary-color)/40 hover:bg-(--bg-primary)/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)/40"
        >
          <div className="text-left">
            {title && (
              <h2 className="font-montserrat text-lg font-semibold text-(--text-primary)">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-(--text-secondary)">{description}</p>
            )}
          </div>

          <svg
            className={`h-5 w-5 shrink-0 text-(--text-secondary) transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-(--quaternary-color)/10 px-6 pb-6 pt-4 md:px-8 md:pb-8">
              {children}
            </div>
          </div>
        </div>
      </section>
    );
  }

  switch (type) {
    case 'header':
      return (
        <section className={baseClass}>
          <div className="flex flex-col gap-6 md:flex-row md:items-cente justify-center">
            {children}
          </div>
          <div className="gradient-banner" />
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
