import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import {
  getEnterpriseController,
  patchEnterpriseController,
  getCollectingDataController,
  patchCollectingDataController,
  upsertCollectingDataController,
} from '../../controllers/protected/enterprise.controller.js';

const router = Router();

router.get('/protected/user/enterprise', requireAuth, getEnterpriseController);
router.patch('/protected/user/enterprise', requireAuth, patchEnterpriseController);
router.get('/protected/user/collecting_data', requireAuth, getCollectingDataController);
router.patch('/protected/user/collecting_data', requireAuth, patchCollectingDataController);
router.put('/protected/user/collecting_data', requireAuth, upsertCollectingDataController);

export default router;
