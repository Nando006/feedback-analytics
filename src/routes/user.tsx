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

export function RouteUser() {
  return (
    <Route
      path="/user"
      errorElement={<ErrorPage />}
      element={<LayoutUser />}>
      <Route
        path="/user/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/user/reports"
        element={<Reports />}
      />
      <Route
        path="/user/edit/customer"
        element={<Customer />}
      />
      <Route
        path="/user/edit/user"
        element={<User />}
      />
      <Route
        path="/user/feedbacks/category"
        element={<Category />}
      />
      <Route
        path="/user/feedbacks/qrcode"
        element={<QRCode />}
      />
      <Route
        path="/user/feedbacks/:id"
        element={<Feedback />}
      />
    </Route>
  );
}
