import type { FeedbackFiltersProps } from './ui.types';

export default function FeedbackFilters({
  filters,
  onSearchChange,
  onRatingFilter,
  onLimitChange,
}: FeedbackFiltersProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 glass-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar por mensagem..."
              value={filters.search}
              onChange={onSearchChange}
              className="w-full pl-4 pr-4 py-3 border border-neutral-800 bg-neutral-900/50 text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Filtro por rating */}
        <div className="flex items-center gap-2">
          <select
            value={filters.rating || ''}
            onChange={(e) =>
              onRatingFilter(
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
            className="px-3 py-3 border border-neutral-800 bg-neutral-900/50 text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">Todos os ratings</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>
        </div>

        {/* Itens por página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-muted)]">Por página:</span>
          <select
            value={filters.limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="px-3 py-3 border border-neutral-800 bg-neutral-900/50 text-[var(--text-primary)] rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
