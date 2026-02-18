import type { LoaderUserDashboard } from 'src/routes/loaders/loaderUserDashboard';
import type { LoaderUserProtected } from 'src/routes/loaders/loaderUserProtected';

/**
 * Tipo auxiliar com os dados do loader protegido do usuário.
 * Usado em: pages/user/dashboard.tsx.
 */
export type UserLoaderData = Awaited<ReturnType<typeof LoaderUserProtected>>;
/**
 * Tipo auxiliar com os dados do loader do dashboard do usuário.
 * Usado em: pages/user/dashboard.tsx.
 */
export type DashboardLoaderData = Awaited<
  ReturnType<typeof LoaderUserDashboard>
>;
