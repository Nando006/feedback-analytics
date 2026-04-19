import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  getQrStatusController,
  enableQrController,
  disableQrController,
  getQrCatalogController,
  upsertCatalogQuestionsController,
  enableCatalogQrController,
  disableCatalogQrController,
} from '../../controllers/protected/collectionPointsQr.controller.js';

const router = Router();

router.get('/protected/user/collection-points/qr/status', requireAuth, getQrStatusController);
router.post('/protected/user/collection-points/qr/enable', requireAuth, enableQrController);
router.post('/protected/user/collection-points/qr/disable', requireAuth, disableQrController);
router.get('/protected/user/collection-points/qr/catalog', requireAuth, getQrCatalogController);
router.post('/protected/user/collection-points/qr/catalog/questions/upsert', requireAuth, upsertCatalogQuestionsController);
router.post('/protected/user/collection-points/qr/catalog/enable', requireAuth, enableCatalogQrController);
router.post('/protected/user/collection-points/qr/catalog/disable', requireAuth, disableCatalogQrController);

export default router;
