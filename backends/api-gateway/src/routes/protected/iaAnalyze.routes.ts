import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import {
  analyzeRawFeedbacksController,
  regenerateFeedbackInsightsController,
} from '../../controllers/protected/iaAnalyze.controller.js';

const router = Router();

router.post('/protected/ia-analyze/analyze-raw', requireAuth, analyzeRawFeedbacksController);
router.post('/protected/ia-analyze/regenerate-insights', requireAuth, regenerateFeedbackInsightsController);

export default router;
