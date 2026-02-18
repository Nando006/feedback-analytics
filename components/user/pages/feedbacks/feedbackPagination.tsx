import type { FeedbackPaginationProps } from './ui.types';

export default function FeedbackPagination({
  pagination,
  onPageChange,
}: FeedbackPaginationProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 glass-card">
      <div className="flex justify-between items-center">
        <div className="text-sm text-[var(--text-muted)]">
          Mostrando {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{' '}
          a{' '}
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems,
          )}{' '}
          de {pagination.totalItems} feedbacks
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/50 text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800/50 transition-colors">
            ←
          </button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, index) => {
                const page = index + 1;
                const isActive = page === pagination.currentPage;

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : 'text-[var(--text-secondary)] hover:bg-neutral-800/50 border border-neutral-800'
                    }`}>
                    {page}
                  </button>
                );
              },
            )}
          </div>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/50 text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800/50 transition-colors">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
