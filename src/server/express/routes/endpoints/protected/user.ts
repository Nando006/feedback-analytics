import express from 'express';
import { requireAuth } from '../../../middleware/auth.js';

export function User(app: express.Express) {
  // Busca os dados do usuário.
  app.get('/api/protected/user/auth_user', requireAuth, async (req, res) => {
    return res.json({ user: req.user });
  });
}
