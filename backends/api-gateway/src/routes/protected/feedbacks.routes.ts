import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.js';
import {
  getFeedbacksController,
  getFeedbacksStatsController,
  getFeedbacksInsightsReportController,
  getFeedbacksAnalysisController,
  getFeedbacksQuestionsController,
} from '../../controllers/protected/feedbacks.controller.js';

const router = Router();

router.get('/protected/user/feedbacks', requireAuth, getFeedbacksController);
router.get('/protected/user/feedbacks/stats', requireAuth, getFeedbacksStatsController);
router.get('/protected/user/feedbacks/insights/report', requireAuth, getFeedbacksInsightsReportController);
router.get('/protected/user/feedbacks/analysis', requireAuth, getFeedbacksAnalysisController);
router.get('/protected/user/feedbacks/questions', requireAuth, getFeedbacksQuestionsController);

export default router;
