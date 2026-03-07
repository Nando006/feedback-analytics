import type { FeedbackPaginationProps } from './ui.types';

export default function FeedbackPagination({
  pagination,
  onPageChange,
}: FeedbackPaginationProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <div className="flex justify-between items-center">
        <div className="text-sm text-[var(--text-tertiary)]">
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
            className="rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) p-2 text-(--text-primary) transition-colors hover:border-(--quaternary-color)/20 hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-50">
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
                        ? 'border border-(--primary-color) bg-(--primary-color) text-white'
                        : 'border border-(--quaternary-color)/14 bg-(--seventh-color) text-(--text-secondary) hover:border-(--quaternary-color)/20 hover:bg-(--bg-tertiary)'
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
            className="rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) p-2 text-(--text-primary) transition-colors hover:border-(--quaternary-color)/20 hover:bg-(--bg-tertiary) disabled:cursor-not-allowed disabled:opacity-50">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
