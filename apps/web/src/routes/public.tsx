
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
import { LoaderPublicQrCodeEnterprise } from './loaders/loaderPublicQrCodeEnterprise';
import { ActionPublicQrCodeFeedback } from './actions/actionPublicQrCodeFeedback';
import ForgotPassword from 'pages/public/forgotPassword';
import { ActionForgotPassword } from './actions/actionForgotPassword';
import ResetPassword from 'pages/public/resetPassword';
import { ActionResetPassword } from './actions/actionResetPassword';

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
        path="forgot-password"
        element={<ForgotPassword />}
        action={ActionForgotPassword}
      />
      <Route 
        path="auth/reset-password"
        element={<ResetPassword />}
        action={ActionResetPassword}
      />
      <Route
        path="feedback/qrcode"
        loader={LoaderPublicQrCodeEnterprise}
        action={ActionPublicQrCodeFeedback}
        element={<FeedbackQRCodeEnterprise />}
      />
      <Route
        path="auth/success"
        element={<AuthSuccess />}
      />
    </Route>
  );
}
