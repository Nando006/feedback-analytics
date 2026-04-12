import express from 'express';
import { registerUserHandler } from '../../controllers/repositories/public/register/handlers.js';

export function EndpointsRegister(app: express.Express) {
  app.post('/api/public/auth/register', registerUserHandler);
}
