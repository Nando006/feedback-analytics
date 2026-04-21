import { Router } from 'express';
import { resendConfirmationController } from '../../controllers/public/resendConfirmation.controller.js';

const router = Router();

router.post('/public/auth/resend-confirmation', resendConfirmationController);

export default router;
