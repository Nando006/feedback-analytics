import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sendMessageToIaAnalyzeHandler } from '../../controllers/repositories/protected/iaAnalyze/handlers.js';

export function EndpointsIAAnalyze(app: express.Express) {
  app.post(
    '/api/protected/ia-analyze/send-message',
    requireAuth,
    sendMessageToIaAnalyzeHandler,
  );
}