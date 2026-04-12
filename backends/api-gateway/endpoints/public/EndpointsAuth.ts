import express from 'express';
import {
  loginHandler,
  logoutHandler,
} from '../../controllers/repositories/public/auth/handlers.js';

export function EndpointsAuth(app: express.Express) {
  app.post('/api/public/auth/login', loginHandler);
  app.post('/api/public/auth/logout', logoutHandler);
}

