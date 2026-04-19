import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sendMessageToIaAnalyzeController } from '../../controllers/protected/iaAnalyze.controller.js';

const router = Router();

router.post('/protected/ia-analyze/send-message', requireAuth, sendMessageToIaAnalyzeController);

export default router;
