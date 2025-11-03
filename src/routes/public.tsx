
import Public from 'layouts/public';
import Home from 'pages/public/home';
import Login from 'pages/public/login';
import Register from 'pages/public/register';
import FeedbackQRCodeEnterprise from 'pages/public/qrcode/enterprise';
import { Route } from 'react-router-dom';
import { ActionLogin } from './actions/actionLogin';
import { ActionRegister } from './actions/actionRegister';
import AuthSuccess from 'pages/public/authSuccess';
import ErrorPage from 'components/globals/handling/errorPage';

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
        element={<FeedbackQRCodeEnterprise />}
      />
      <Route
        path="auth/success"
        element={<AuthSuccess />}
      />
    </Route>
  );
}
