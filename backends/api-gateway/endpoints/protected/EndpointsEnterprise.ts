import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  getCollectingDataHandler,
  getEnterpriseHandler,
  patchCollectingDataHandler,
  patchEnterpriseHandler,
  upsertCollectingDataHandler,
} from '../../controllers/repositories/enterprise/handlers.js';

export function EndpointsEnterprise(app: express.Express) {
  app.get('/api/protected/user/enterprise', requireAuth, getEnterpriseHandler);

  app.patch(
    '/api/protected/user/enterprise',
    requireAuth,
    patchEnterpriseHandler,
  );

  app.get(
    '/api/protected/user/collecting_data',
    requireAuth,
    getCollectingDataHandler,
  );

  app.patch(
    '/api/protected/user/collecting_data',
    requireAuth,
    patchCollectingDataHandler,
  );

  app.put(
    '/api/protected/user/collecting_data',
    requireAuth,
    upsertCollectingDataHandler,
  );
}
