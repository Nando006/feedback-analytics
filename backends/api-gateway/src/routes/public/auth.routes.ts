import { Router } from 'express';
import { loginController, logoutController } from '../../controllers/public/auth.controller.js';

const router = Router();

router.post('/public/auth/login', loginController);
router.post('/public/auth/logout', logoutController);

export default router;
