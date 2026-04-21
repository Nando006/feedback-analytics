import { Router } from 'express';
import { registerUserController } from '../../controllers/public/register.controller.js';

const router = Router();

router.post('/public/auth/register', registerUserController);

export default router;
