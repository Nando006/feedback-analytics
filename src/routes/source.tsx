import ErrorPage from 'components/globals/handling/errorPage';
import { ToastProvider } from 'components/public/forms/messages/statusNotification';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom';
import { RoutePublic } from './public';
import { RouteUser } from './user';
import FallbackType01 from 'components/fallbacks/fallbackType01';

export default function Source() {
  const router = createBrowserRouter([
    {
      id: 'root',
      path: '/',
      // lazy: () => import('./root'),
      errorElement: <ErrorPage />,
      hydrateFallbackElement: <FallbackType01 />,
      children: createRoutesFromElements(
        <>
          {RoutePublic()}
          {RouteUser()}
        </>,
      ),
    },
  ]);

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}
