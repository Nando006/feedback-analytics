import express from 'express';
import { Callback } from './endpoints/public/callback.js';
import { Login } from './endpoints/public/login.js';
import { Logout } from './endpoints/public/logout.js';
import { Register } from './endpoints/public/register.js';
import { QrcodeFeedback } from './endpoints/public/qrcode/feedback.js';
import { EnterprisePublic } from './endpoints/public/enterprise.js';

export function PublicRoutes(app: express.Express) {
  Callback(app);
  Login(app);
  Logout(app);
  Register(app);
  QrcodeFeedback(app);
  EnterprisePublic(app);
}
