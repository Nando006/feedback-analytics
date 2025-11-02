import { useState, useEffect, useCallback } from 'react';
import { ServiceGetFeedbacks, ServiceGetFeedbackStats } from 'src/services/serviceFeedbacks';
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
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );

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

  // Função para buscar feedbacks (memoizada para respeitar react-hooks/exhaustive-deps)
  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ServiceGetFeedbacks(filters);
      setFeedbacks(response.feedbacks);
      setPagination(response.pagination);
    } catch (err) {
      setError('Erro ao carregar feedbacks');
      console.error('Erro ao buscar feedbacks:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Função para buscar estatísticas (memoizada)
  const fetchStats = useCallback(async () => {
    try {
      const response = await ServiceGetFeedbackStats();
      setStats(response);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    fetchFeedbacks();
    fetchStats();
  }, [fetchFeedbacks, fetchStats]);

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

  const closeModal = () => setSelectedFeedback(null);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              onClick={() => setSelectedFeedback(feedback)}
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

      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 glass-card"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Detalhes do Feedback
              </h2>
              <button
                onClick={closeModal}
                className="px-3 py-1 text-sm rounded-md border border-neutral-700 hover:bg-neutral-800 text-[var(--text-secondary)]">
                Fechar
              </button>
            </div>

            <div className="space-y-6 text-sm">
              {/* Bloco principal */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-neutral-700 bg-neutral-800 text-[var(--text-secondary)]">
                    Rating: {selectedFeedback.rating}
                  </span>
                  <span className="text-[var(--text-muted)]">
                    Criado: {formatDateTime(selectedFeedback.created_at)}
                  </span>
                  {selectedFeedback.updated_at && (
                    <span className="text-[var(--text-muted)]">
                      Atualizado: {formatDateTime(selectedFeedback.updated_at)}
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {selectedFeedback.message}
                </p>
              </div>

              {/* Ponto de coleta */}
              <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/60 space-y-2">
                <h3 className="font-medium text-[var(--text-secondary)] text-sm">
                  Ponto de Coleta
                </h3>
                {selectedFeedback.collection_points ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[var(--text-muted)]">
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Nome:
                      </span>{' '}
                      {selectedFeedback.collection_points.name}
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Tipo:
                      </span>{' '}
                      {selectedFeedback.collection_points.type}
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Identificador:
                      </span>{' '}
                      {selectedFeedback.collection_points.identifier || '—'}
                    </div>
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] text-sm">
                    Nenhuma informação de ponto de coleta.
                  </div>
                )}
              </div>

              {/* Dispositivo rastreado */}
              <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/60 space-y-2">
                <h3 className="font-medium text-[var(--text-secondary)] text-sm">
                  Dispositivo
                </h3>
                {selectedFeedback.tracked_devices ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[var(--text-muted)]">
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Fingerprint:
                      </span>{' '}
                      {selectedFeedback.tracked_devices.device_fingerprint ||
                        '—'}
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Feedbacks:
                      </span>{' '}
                      {selectedFeedback.tracked_devices.feedback_count ?? 0}
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">IP:</span>{' '}
                      {selectedFeedback.tracked_devices.ip_address || '—'}
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Blocked:
                      </span>{' '}
                      {selectedFeedback.tracked_devices.is_blocked
                        ? 'Sim'
                        : 'Não'}
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-[var(--text-secondary)]">
                        User Agent:
                      </span>{' '}
                      {selectedFeedback.tracked_devices.user_agent || '—'}
                    </div>
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] text-sm">
                    Nenhuma informação de dispositivo.
                  </div>
                )}
              </div>

              {/* Cliente */}
              <div className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/60 space-y-2">
                <h3 className="font-medium text-[var(--text-secondary)] text-sm">
                  Cliente
                </h3>
                {selectedFeedback.tracked_devices?.customer ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[var(--text-muted)]">
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Nome:
                      </span>{' '}
                      {selectedFeedback.tracked_devices.customer.name || '—'}
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Email:
                      </span>{' '}
                      {selectedFeedback.tracked_devices.customer.email || '—'}
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Gênero:
                      </span>{' '}
                      {selectedFeedback.tracked_devices.customer.gender || '—'}
                    </div>
                  </div>
                ) : (
                  <div className="text-[var(--text-muted)] text-sm">
                    Nenhuma informação de cliente foi cadastrada.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
