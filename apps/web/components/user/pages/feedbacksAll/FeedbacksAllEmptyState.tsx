import type { FeedbacksAllEmptyStateProps } from './ui.types';

export default function FeedbacksAllEmptyState({
  hasFilters,
}: FeedbacksAllEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-12 glass-card">
      <div className="font-work-sans text-center">
        <div className="mb-2 text-lg text-(--text-primary)">Nenhum feedback encontrado</div>
        <div className="text-sm text-(--text-tertiary)">
          {hasFilters
            ? 'Tente ajustar os filtros de busca'
            : 'Ainda não há feedbacks registrados'}
        </div>
      </div>
    </div>
  );
}
