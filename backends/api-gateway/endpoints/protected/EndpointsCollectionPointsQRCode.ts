import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  disableCatalogQrHandler,
  disableQrHandler,
  enableCatalogQrHandler,
  enableQrHandler,
  getQrCatalogHandler,
  getQrStatusHandler,
  upsertCatalogQuestionsHandler,
} from '../../controllers/repositories/collectionPointsQr/handlers.js';

export function EndpointsCollectionPointsQRCode(app: express.Express) {
  app.get(
    '/api/protected/user/collection-points/qr/status',
    requireAuth,
    getQrStatusHandler,
  );

  app.post(
    '/api/protected/user/collection-points/qr/enable',
    requireAuth,
    enableQrHandler,
  );

  app.post(
    '/api/protected/user/collection-points/qr/disable',
    requireAuth,
    disableQrHandler,
  );

  app.get(
    '/api/protected/user/collection-points/qr/catalog',
    requireAuth,
    getQrCatalogHandler,
  );

  app.post(
    '/api/protected/user/collection-points/qr/catalog/questions/upsert',
    requireAuth,
    upsertCatalogQuestionsHandler,
  );

  app.post(
    '/api/protected/user/collection-points/qr/catalog/enable',
    requireAuth,
    enableCatalogQrHandler,
  );

  app.post(
    '/api/protected/user/collection-points/qr/catalog/disable',
    requireAuth,
    disableCatalogQrHandler,
  );
}
