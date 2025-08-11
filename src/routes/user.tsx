import ErrorPage from 'components/user/handling/errorPage';
import Dashboard from 'pages/user/dashboard';
import Customer from 'pages/user/edit/customer';
import User from 'pages/user/edit/user';
import Category from 'pages/user/feedbacks/category';
import Feedback from 'pages/user/feedbacks/feedback';
import QRCode from 'pages/user/feedbacks/QRCode';
import Reports from 'pages/user/reports';
import LayoutUser from 'layouts/user';
import { Route } from 'react-router-dom';
import { LoaderUserProtected } from 'lib/loaders/loaderUserProtected';

export function RouteUser() {
  return (
    <Route
      path="/user"
      errorElement={<ErrorPage />}
      element={<LayoutUser />}
      loader={LoaderUserProtected}>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="reports"
        element={<Reports />}
      />
      <Route
        path="edit/customer"
        element={<Customer />}
      />
      <Route
        path="edit/user"
        element={<User />}
      />
      <Route
        path="feedbacks/category"
        element={<Category />}
      />
      <Route
        path="feedbacks/qrcode"
        element={<QRCode />}
      />
      <Route
        path="feedbacks/:id"
        element={<Feedback />}
      />
    </Route>
  );
}
