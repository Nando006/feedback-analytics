import { useState, type ChangeEvent } from 'react';
import { useLoaderData, useNavigation, useSearchParams } from 'react-router-dom';
import type {
  Feedback,
  FeedbackPagination as FeedbackPaginationType,
  FeedbackStats,
} from 'lib/interfaces/domain/feedback.domain';
import type { LoaderFeedbacksAll } from 'src/routes/loaders/loaderFeedbacksAll';
import FeedbackHeader from 'components/user/pages/feedbacks/feedbackHeader';
import FeedbackFiltersComponent from 'components/user/pages/feedbacks/feedbackFilters';
import FeedbackCard from 'components/user/pages/feedbacks/feedbackCard';
import FeedbackPagination from 'components/user/pages/feedbacks/feedbackPagination';
import FeedbacksAllLoadingState from 'components/user/pages/feedbacksAll/FeedbacksAllLoadingState';
import FeedbacksAllErrorState from 'components/user/pages/feedbacksAll/FeedbacksAllErrorState';
import FeedbacksAllEmptyState from 'components/user/pages/feedbacksAll/FeedbacksAllEmptyState';
import FeedbacksAllLoadingOverlay from 'components/user/pages/feedbacksAll/FeedbacksAllLoadingOverlay';
import FeedbackDetailsModal from 'components/user/pages/feedbacksAll/FeedbackDetailsModal';

export default function FeedbacksAll() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const loaderData = useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksAll>>>();

  const feedbacks: Feedback[] = loaderData?.feedbacks ?? [];
  const stats: FeedbackStats | null = loaderData?.stats ?? null;
  const pagination: FeedbackPaginationType | null = loaderData?.pagination ?? null;
  const filters = loaderData?.filters ?? {
    page: 1,
    limit: 10,
    rating: undefined,
    search: '',
  };
  const error = loaderData?.error ?? null;
  const loading =
    navigation.state === 'loading' &&
    navigation.location?.pathname === '/user/feedbacks/all';

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );

  const updateSearchParams = (next: {
    page?: number;
    limit?: number;
    rating?: number;
    search?: string;
  }) => {
    const params = new URLSearchParams(searchParams);

    const page = next.page ?? filters.page;
    const limit = next.limit ?? filters.limit;
    const rating = next.rating ?? filters.rating;
    const search = next.search ?? filters.search;

    params.set('page', String(page));
    params.set('limit', String(limit));

    if (rating) {
      params.set('rating', String(rating));
    } else {
      params.delete('rating');
    }

    if (search.trim()) {
      params.set('search', search);
    } else {
      params.delete('search');
    }

    setSearchParams(params);
  };

  // Handlers
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({ search: e.target.value, page: 1 });
  };

  const handleRatingFilter = (rating: number | undefined) => {
    updateSearchParams({ rating, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page });
  };

  const handleLimitChange = (limit: number) => {
    updateSearchParams({ limit, page: 1 });
  };

  const closeModal = () => setSelectedFeedback(null);

  if (loading && !feedbacks.length && !error) {
    return <FeedbacksAllLoadingState />;
  }

  if (error) {
    return <FeedbacksAllErrorState error={error} />;
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
          <FeedbacksAllEmptyState hasFilters={Boolean(filters.search || filters.rating)} />
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
        <FeedbacksAllLoadingOverlay />
      )}

      {selectedFeedback && (
        <FeedbackDetailsModal
          selectedFeedback={selectedFeedback}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
