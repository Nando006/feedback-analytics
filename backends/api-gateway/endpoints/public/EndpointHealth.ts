import express from 'express';
import { getHealthHandler } from '../../controllers/repositories/public/health/handlers.js';

export function EndpointsHealth(app: express.Express) {
  app.get('/api/health', getHealthHandler);
}
