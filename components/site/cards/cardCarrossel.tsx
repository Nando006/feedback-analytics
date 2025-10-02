import type { ICarrousselCard } from 'lib/interfaces/site/card';

export default function CardCarrossel({ title, description }: ICarrousselCard) {
  return (
    <div className="min-w-86 w-86 h-48 bg-[var(--color-surface)] rounded-xl overflow-hidden shadow-lg border border-[var(--color-border)] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)]"></div>

      <h4
        style={{ fontFamily: 'var(--font-mont-serrat)' }}
        className="p-3 text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-primary-light)]"></span>
        {title}
      </h4>

      <div
        style={{ fontFamily: 'var(--font-poppins)' }}
        className="h-full p-4 text-base font-medium leading-relaxed text-[var(--color-text-muted)]">
        {description}
      </div>
    </div>
  );
}
