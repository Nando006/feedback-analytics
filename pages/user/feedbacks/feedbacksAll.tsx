import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useLoaderData, useNavigation, useSearchParams } from 'react-router-dom';
import type {
  FeedbackCategory,
  Feedback,
  FeedbackPagination as FeedbackPaginationType,
  FeedbackStats,
} from 'lib/interfaces/domain/feedback.domain';
import type { LoaderFeedbacksAll } from 'src/routes/loaders/loaderFeedbacksAll';
import FeedbackHeader from 'components/user/pages/feedbacks/feedbackHeader';
import FeedbackFiltersComponent from 'components/user/pages/feedbacks/feedbackFilters';
import FeedbackCard from 'components/user/pages/feedbacks/feedbackCard';
import FeedbackPagination from 'components/user/pages/feedbacks/feedbackPagination';
import FeedbacksAllErrorState from 'components/user/pages/feedbacksAll/FeedbacksAllErrorState';
import FeedbacksAllEmptyState from 'components/user/pages/feedbacksAll/FeedbacksAllEmptyState';
import FeedbacksAllLoadingOverlay from 'components/user/pages/feedbacksAll/FeedbacksAllLoadingOverlay';
import FeedbackDetailsModal from 'components/user/pages/feedbacksAll/FeedbackDetailsModal';

export default function FeedbacksAll() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const loaderData = useLoaderData<Awaited<ReturnType<typeof LoaderFeedbacksAll>>>();

  const [suppressOverlay, setSuppressOverlay] = useState(false);

  const feedbacks: Feedback[] = loaderData?.feedbacks ?? [];
  const stats: FeedbackStats | null = loaderData?.stats ?? null;
  const pagination: FeedbackPaginationType | null = loaderData?.pagination ?? null;
  const filters = loaderData?.filters ?? {
    page: 1,
    limit: 10,
    rating: undefined,
    search: '',
    category: undefined,
    item: '',
  };
  const error = loaderData?.error ?? null;
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [itemInput, setItemInput] = useState(filters.item ?? '');
  const loading =
    navigation.state === 'loading' &&
    navigation.location?.pathname === '/user/feedbacks/all';

  useEffect(() => {
    if (navigation.state === 'idle') {
      setSuppressOverlay(false);
    }
  }, [navigation.state]);

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );

  const updateSearchParams = useCallback((next: {
    page?: number;
    limit?: number;
    rating?: number;
    search?: string;
    category?: FeedbackCategory;
    item?: string;
  }) => {
    const params = new URLSearchParams(searchParams);
    const hasKey = <K extends keyof typeof next>(key: K) =>
      Object.prototype.hasOwnProperty.call(next, key);

    const page = hasKey('page') ? next.page ?? filters.page : filters.page;
    const limit = hasKey('limit') ? next.limit ?? filters.limit : filters.limit;
    const rating = hasKey('rating') ? next.rating : filters.rating;
    const search = hasKey('search') ? (next.search ?? '') : searchInput;
    const category = hasKey('category') ? next.category : filters.category;
    const item = hasKey('item') ? (next.item ?? '') : itemInput;

    params.set('page', String(page));
    params.set('limit', String(limit));

    if (typeof rating === 'number') {
      params.set('rating', String(rating));
    } else {
      params.delete('rating');
    }

    if (search.trim()) {
      params.set('search', search);
    } else {
      params.delete('search');
    }

    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }

    if (item.trim()) {
      params.set('item', item);
    } else {
      params.delete('item');
    }

    setSearchParams(params);
  }, [
    searchParams,
    setSearchParams,
    filters.page,
    filters.limit,
    filters.rating,
    filters.category,
    searchInput,
    itemInput,
  ]);

  useEffect(() => {
    if (searchInput === (filters.search ?? '') && itemInput === (filters.item ?? '')) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setSuppressOverlay(true);
      updateSearchParams({
        search: searchInput,
        item: itemInput,
        page: 1,
      });
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [searchInput, itemInput, filters.search, filters.item, updateSearchParams]);

  // Handlers
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleRatingFilter = (rating: number | undefined) => {
    setSuppressOverlay(true);
    updateSearchParams({ rating, page: 1 });
  };

  const handleItemChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItemInput(e.target.value);
  };

  const handleCategoryFilter = (category: FeedbackCategory | undefined) => {
    setSuppressOverlay(true);
    updateSearchParams({ category, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setSuppressOverlay(true);
    updateSearchParams({ page });
  };

  const handleLimitChange = (limit: number) => {
    setSuppressOverlay(true);
    updateSearchParams({ limit, page: 1 });
  };

  const closeModal = () => setSelectedFeedback(null);

  if (error) {
    return <FeedbacksAllErrorState error={error} />;
  }

  return (
    <div className="font-work-sans space-y-6 pb-8">
      {/* Header com estatísticas */}
      <FeedbackHeader stats={stats} />


      {/* Filtros */}
      <FeedbackFiltersComponent
        filters={{ ...filters, search: searchInput, item: itemInput }}
        onSearchChange={handleSearchChange}
        onItemChange={handleItemChange}
        onRatingFilter={handleRatingFilter}
        onCategoryFilter={handleCategoryFilter}
        onLimitChange={handleLimitChange}
      />

      {/* Lista de feedbacks + Paginação + Overlay */}
      <div className="relative">
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <FeedbacksAllEmptyState
              hasFilters={Boolean(
                searchInput || filters.rating || filters.category || itemInput,
              )}
            />
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

        {/* Loading overlay (agora cobre só a lista/paginação, nunca os filtros) */}
        {loading && feedbacks.length > 0 && !suppressOverlay && (
          <FeedbacksAllLoadingOverlay />
        )}
      </div>

      {selectedFeedback && (
        <FeedbackDetailsModal
          selectedFeedback={selectedFeedback}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
