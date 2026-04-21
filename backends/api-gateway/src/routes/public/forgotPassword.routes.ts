import { Router } from 'express';
import { forgotPasswordController } from '../../controllers/public/forgotPassword.controller.js';

const router = Router();

router.post('/public/auth/forgot-password', forgotPasswordController);

export default router;
