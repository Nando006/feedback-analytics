import type { ISectionTitleProps } from 'lib/interfaces/site/section';

// Componente para exibir o título da seção
export default function SectionTitle({
  title,
  subtitle,
  light = false,
  center = true,
}: ISectionTitleProps) {
  return (
    <div className={`${center ? 'text-center' : ''} mb-8`}>
      <h2
        style={{ fontFamily: 'var(--font-mont-serrat)' }}
        className={`text-3xl md:text-4xl font-bold ${
          light
            ? 'text-white drop-shadow-md'
            : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent'
        } inline-block mb-4`}>
        {title}
      </h2>
      <div
        className={`w-24 h-1 bg-gradient-to-r ${
          light
            ? 'from-white to-[var(--color-primary-light)]'
            : 'from-[var(--color-primary)] to-[var(--color-primary-hover)]'
        } ${center ? 'mx-auto' : ''}`}></div>
      {subtitle && (
        <p
          style={{ fontFamily: 'var(--font-poppins)' }}
          className={`${
            light ? 'text-white/80' : 'text-[var(--color-text-muted)]'
          } max-w-xl ${center ? 'mx-auto' : ''} mt-4 font-medium`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
