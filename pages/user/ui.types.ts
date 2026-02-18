import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { LoaderUserProtected } from 'src/routes/loaders/loaderUserProtected';

export type UserLoaderData = Awaited<ReturnType<typeof LoaderUserProtected>>;
export type DashboardLoaderData = Awaited<
  ReturnType<typeof LoaderUserDashboard>
>;
