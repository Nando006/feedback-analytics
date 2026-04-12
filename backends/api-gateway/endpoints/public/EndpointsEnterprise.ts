import express from 'express';
import { getPublicEnterpriseHandler } from '../../controllers/repositories/public/enterprise/handlers.js';

export function EndpointsEnterprise(app: express.Express) {
  app.get('/api/public/enterprise/:id', getPublicEnterpriseHandler);
}
