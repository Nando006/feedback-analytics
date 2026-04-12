import express from 'express';
import { resendConfirmationHandler } from '../../controllers/repositories/public/resendConfirmation/handlers.js';

export function EndpointResendConfirmation(app: express.Express) {
  app.post('/api/public/auth/resend-confirmation', resendConfirmationHandler);
}