import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  getFeedbacksAnalysisHandler,
  getFeedbacksHandler,
  getFeedbacksInsightsReportHandler,
  getFeedbacksStatsHandler,
} from '../../controllers/repositories/protected/feedbacks/handlers.js';

export function EndpointsFeedbacks(app: express.Express) {
  app.get('/api/protected/user/feedbacks', requireAuth, getFeedbacksHandler);

  app.get(
    '/api/protected/user/feedbacks/stats',
    requireAuth,
    getFeedbacksStatsHandler,
  );

  app.get(
    '/api/protected/user/feedbacks/insights/report',
    requireAuth,
    getFeedbacksInsightsReportHandler,
  );

  app.get(
    '/api/protected/user/feedbacks/analysis',
    requireAuth,
    getFeedbacksAnalysisHandler,
  );
}
