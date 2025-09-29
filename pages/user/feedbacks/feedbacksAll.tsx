import { useState, useEffect } from 'react';
import { getFeedbacks, getFeedbackStats } from 'src/services/feedbacks';
import type {
  Feedback,
  FeedbacksResponse,
  FeedbackStats,
  FeedbackFilters,
} from 'lib/interfaces/user/feedback';
import FeedbackHeader from 'components/user/feedbacks/feedbackHeader';
import FeedbackFiltersComponent from 'components/user/feedbacks/feedbackFilters';
import FeedbackCard from 'components/user/feedbacks/feedbackCard';
import FeedbackPagination from 'components/user/feedbacks/feedbackPagination';

export default function FeedbacksAll() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros e paginação
  const [filters, setFilters] = useState<FeedbackFilters>({
    page: 1,
    limit: 10,
    rating: undefined,
    search: '',
  });
  const [pagination, setPagination] = useState<
    FeedbacksResponse['pagination'] | null
  >(null);

  // Função para buscar feedbacks
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFeedbacks(filters);
      setFeedbacks(response.feedbacks);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erro ao carregar feedbacks');
      console.error('Erro ao buscar feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar estatísticas
  const fetchStats = async () => {
    try {
      const response = await getFeedbackStats();
      setStats(response);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [filters]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleRatingFilter = (rating: number | undefined) => {
    setFilters((prev) => ({ ...prev, rating, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  if (loading && !feedbacks.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[var(--text-primary)]">
          Carregando feedbacks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="font-inter space-y-6">
      {/* Header com estatísticas */}
      <FeedbackHeader stats={stats} />

      {/* Filtros */}
      <FeedbackFiltersComponent
        filters={filters}
        onSearchChange={handleSearchChange}
        onRatingFilter={handleRatingFilter}
        onLimitChange={handleLimitChange}
      />

      {/* Lista de feedbacks */}
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-12 glass-card">
            <div className="text-center">
              <div className="text-[var(--text-primary)] text-lg mb-2">
                Nenhum feedback encontrado
              </div>
              <div className="text-[var(--text-muted)] text-sm">
                {filters.search || filters.rating
                  ? 'Tente ajustar os filtros de busca'
                  : 'Ainda não há feedbacks registrados'}
              </div>
            </div>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
            />
          ))
        )}
      </div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <FeedbackPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      {/* Loading overlay */}
      {loading && feedbacks.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 glass-card">
            <div className="text-center text-[var(--text-primary)]">
              Carregando...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
