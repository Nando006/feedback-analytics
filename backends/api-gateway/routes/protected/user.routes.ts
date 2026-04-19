import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import {
  getAuthUserController,
  patchUserEmailController,
  patchUserMetadadosController,
  startUserPhoneVerificationController,
  verifyUserPhoneController,
  resetPasswordController,
} from '../../controllers/protected/user.controller.js';

const router = Router();

router.get('/protected/user/auth_user', requireAuth, getAuthUserController);
router.patch('/protected/user/email', requireAuth, patchUserEmailController);
router.patch('/protected/user/metadados', requireAuth, patchUserMetadadosController);
router.post('/protected/user/phone/start', requireAuth, startUserPhoneVerificationController);
router.post('/protected/user/phone/verify', requireAuth, verifyUserPhoneController);
router.patch('/protected/user/password', requireAuth, resetPasswordController);

export default router;
