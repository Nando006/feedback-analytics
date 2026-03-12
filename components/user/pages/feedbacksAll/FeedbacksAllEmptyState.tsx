import type { FeedbacksAllEmptyStateProps } from './ui.types';

export default function FeedbacksAllEmptyState({
  hasFilters,
}: FeedbacksAllEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-12 glass-card">
      <div className="text-center">
        <div className="font-work-sans mb-2 text-lg text-(--text-primary)">Nenhum feedback encontrado</div>
        <div className="font-work-sans text-sm text-(--text-tertiary)">
          {hasFilters
            ? 'Tente ajustar os filtros de busca'
            : 'Ainda não há feedbacks registrados'}
        </div>
      </div>
    </div>
  );
}
