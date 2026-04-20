import { Router } from 'express';
import { getHealthController } from '../../controllers/public/health.controller.js';

const router = Router();

router.get('/health', getHealthController);

export default router;
