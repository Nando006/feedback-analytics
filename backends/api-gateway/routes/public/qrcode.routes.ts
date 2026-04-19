import { Router } from 'express';
import { submitQrCodeFeedbackController } from '../../controllers/public/qrcode.controller.js';

const router = Router();

router.post('/public/qrcode/feedback', submitQrCodeFeedbackController);

export default router;
