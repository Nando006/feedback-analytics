import express from 'express';
import { Callback } from './endpoints/public/callback';
import { Login } from './endpoints/public/login';
import { Logout } from './endpoints/public/logout';
import { Register } from './endpoints/public/register';
import { FeedbackPublic } from './endpoints/public/feedback';
import { EnterprisePublic } from './endpoints/public/enterprise';
import { TestFingerprint } from './endpoints/public/test-fingerprint';

export function PublicRoutes(app: express.Express) {
  Callback(app);
  Login(app);
  Logout(app);
  Register(app);
  FeedbackPublic(app);
  EnterprisePublic(app);
  TestFingerprint(app);
}
