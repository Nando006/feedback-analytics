import ErrorPage from 'components/globals/handling/errorPage';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { RoutePublic } from './public';
import { RouteUser } from './user';

export default function Source() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        errorElement={<ErrorPage />}>
        {RoutePublic()}
        {RouteUser()}
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
}
