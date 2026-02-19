import type { LoaderFunctionArgs } from 'react-router-dom';
import {
  loadFeedbacksAllData,
  parseFeedbacksAllFilters,
} from 'src/routes/load/loadFeedbacksAll';

export async function LoaderFeedbacksAll({ request }: LoaderFunctionArgs) {
  const filters = parseFeedbacksAllFilters(new URL(request.url));

  return await loadFeedbacksAllData({
    page: filters.page,
    limit: filters.limit,
    rating: filters.rating,
    search: filters.search,
  });
}
