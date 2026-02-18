import type { FeedbacksAllEmptyStateProps } from './ui.types';

export default function FeedbacksAllEmptyState({
  hasFilters,
}: FeedbacksAllEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 glass-card">
      <div className="text-center">
        <div className="mb-2 text-lg text-[var(--text-primary)]">Nenhum feedback encontrado</div>
        <div className="text-sm text-[var(--text-muted)]">
          {hasFilters
            ? 'Tente ajustar os filtros de busca'
            : 'Ainda não há feedbacks registrados'}
        </div>
      </div>
    </div>
  );
}
