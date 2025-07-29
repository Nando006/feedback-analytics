import ErrorPage from 'components/public/handling/errorPage';
import Public from 'layouts/public';
import FeedbackQRCode from 'pages/public/feedbackQRCode';
import Home from 'pages/public/home';
import Login from 'pages/public/login';
import Register from 'pages/public/register';
import { Route } from 'react-router-dom';

export function RoutePublic() {
  return (
    <Route
      path="/"
      element={<Public />}
      errorElement={<ErrorPage />}>
      <Route
        path="/"
        element={<Home />}
      />
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/register"
        element={<Register />}
      />
      <Route
        path="/feedback/qrcode"
        element={<FeedbackQRCode />}
      />
    </Route>
  );
}
