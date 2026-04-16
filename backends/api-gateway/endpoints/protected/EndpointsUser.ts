import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  getAuthUserHandler,
  patchUserEmailHandler,
  patchUserMetadadosHandler,
  resetPasswordHandler,
  startUserPhoneVerificationHandler,
  verifyUserPhoneHandler,
} from '../../controllers/repositories/protected/user/handlers.js';

export function EndpointsUser(app: express.Express) {
  app.get('/api/protected/user/auth_user', requireAuth, getAuthUserHandler);

  app.patch('/api/protected/user/email', requireAuth, patchUserEmailHandler);

  app.patch(
    '/api/protected/user/metadados',
    requireAuth,
    patchUserMetadadosHandler
  );

  app.post(
    '/api/protected/user/phone/start',
    requireAuth,
    startUserPhoneVerificationHandler
  );

  app.post(
    '/api/protected/user/phone/verify',
    requireAuth,
    verifyUserPhoneHandler
  );

  app.patch(
    '/api/protected/user/password',
    requireAuth,
    resetPasswordHandler,
  );
}
