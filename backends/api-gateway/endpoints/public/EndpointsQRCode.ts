import express from 'express';
import { submitQrCodeFeedbackHandler } from '../../controllers/repositories/public/qrcode/handlers.js';

export function EndpointsQRCode(app: express.Express) {
  app.post('/api/public/qrcode/feedback', submitQrCodeFeedbackHandler);
}
