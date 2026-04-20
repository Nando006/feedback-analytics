import { Router } from 'express';
import { authCallbackController } from '../../controllers/public/callback.controller.js';

const router = Router();

router.get('/public/auth/callback', authCallbackController);

export default router;
