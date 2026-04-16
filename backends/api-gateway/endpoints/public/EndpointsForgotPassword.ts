import express from 'express';
import { forgotPasswordHandler } from '../../controllers/repositories/public/forgotPassword/handlers.js';

// Registra a rota pública de "esqueci minha senha".
// Não exige autenticação — o usuário ainda não tem sessão.
export function EndpointsForgotPassword(app: express.Express) {
  app.post('/api/public/auth/forgot-password', forgotPasswordHandler);
}
