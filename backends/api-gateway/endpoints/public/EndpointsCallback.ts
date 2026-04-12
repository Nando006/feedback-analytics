import express from 'express';
import { authCallbackHandler } from '../../controllers/repositories/public/callback/handlers.js';

export function EndpointsCallback(app: express.Express) {
  app.get('/api/public/auth/callback', authCallbackHandler);
}
