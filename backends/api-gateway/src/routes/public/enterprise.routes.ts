import { Router } from 'express';
import { getPublicEnterpriseController } from '../../controllers/public/enterprise.controller.js';

const router = Router();

router.get('/public/enterprise/:id', getPublicEnterpriseController);

export default router;
