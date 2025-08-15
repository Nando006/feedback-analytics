import express from 'express';
import { registerPublicAuthRoutes } from './auth/public';
import { registerProtectedAuthRoutes } from './auth/protected';

export function RegisterAuthRoutes(app: express.Express) {
  registerPublicAuthRoutes(app);
  registerProtectedAuthRoutes(app);
}
