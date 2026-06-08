import type { FeedbackFiltersProps } from './ui.types';

export default function FeedbackFilters({
  filters,
  onSearchChange,
  onItemChange,
  onRatingFilter,
  onCategoryFilter,
  onSentimentFilter,
  onLimitChange,
}: FeedbackFiltersProps) {
  return (
    <div className="font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Busca */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Buscar por mensagem..."
              value={filters.search}
              onChange={onSearchChange}
              className="w-full rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
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
            className="rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-3 font-poppins text-(--text-primary) outline-none focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20">
            <option value="">Ratings</option>
            <option value="5">5 estrelas</option>
            <option value="4">4 estrelas</option>
            <option value="3">3 estrelas</option>
            <option value="2">2 estrelas</option>
            <option value="1">1 estrela</option>
          </select>
        </div>

        {/* Filtro por Sentimento */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sentiment || ''}
            onChange={(e) =>
              onSentimentFilter(
                e.target.value ? (e.target.value as 'positive' | 'neutral' | 'negative' | 'all') : undefined,
              )
            }
            className="rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-3 font-poppins text-(--text-primary) outline-none focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20">
            <option value="">Sentimentos</option>
            <option value="all">Analisados</option>
            <option value="positive">Positivos</option>
            <option value="neutral">Neutros</option>
            <option value="negative">Negativos</option>
          </select>
        </div>

        {/* Filtro por categoria */}
        <div className="flex items-center gap-2">
          <select
            value={filters.category || ''}
            onChange={(e) =>
              onCategoryFilter(
                e.target.value
                  ? (e.target.value as
                    | 'COMPANY'
                    | 'PRODUCT'
                    | 'SERVICE'
                    | 'DEPARTMENT')
                  : undefined,
              )
            }
            className="rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-3 font-poppins text-(--text-primary) outline-none focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20">
            <option value="">Categorias</option>
            <option value="COMPANY">Empresa</option>
            <option value="PRODUCT">Produto</option>
            <option value="SERVICE">Serviços</option>
            <option value="DEPARTMENT">Departamentos</option>
          </select>
        </div>

        {/* Filtro por item */}
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Filtrar por item (ex: Bola...)"
              value={filters.item || ''}
              onChange={onItemChange}
              className="w-full rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-4 py-3 text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
            />
          </div>
        </div>

        {/* Itens por página */}
        <div className="flex items-center gap-2">
          <select
            value={filters.limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="rounded-xl border border-(--quaternary-color)/14 bg-(--seventh-color) px-3 py-3 font-poppins text-(--text-primary) outline-none focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20">
            <option value={5}>5/pág</option>
            <option value={10}>10/pág</option>
            <option value={20}>20/pág</option>
            <option value={50}>50/pág</option>
          </select>
        </div>
      </div>
    </div>
  );
}
