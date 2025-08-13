import ErrorPage from 'components/public/handling/errorPage';
import Public from 'layouts/public';
import FeedbackQRCode from 'pages/public/feedbackQRCode';
import Home from 'pages/public/home';
import Login from 'pages/public/login';
import Register from 'pages/public/register';
import { Route } from 'react-router-dom';
import { ActionLogin } from './actions/actionLogin';
import { ActionRegister } from './actions/actionRegister';
import AuthSuccess from 'pages/public/authSuccess';

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
        path="login"
        element={<Login />}
        action={ActionLogin}
      />
      <Route
        path="register"
        element={<Register />}
        action={ActionRegister}
      />
      <Route
        path="feedback/qrcode"
        element={<FeedbackQRCode />}
      />
      <Route
        path="auth/success"
        element={<AuthSuccess />}
      />
    </Route>
  );
}
