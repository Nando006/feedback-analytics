import express from 'express';
import { requireAuth } from '../../middleware/auth';

export function registerProtectedAuthRoutes(app: express.Express) {
  app.get('/api/user/auth_user', requireAuth, async (req, res) => {
    return res.json({ user: req.user });
  });

  app.get('/api/user/enterprise', requireAuth, async (req, res) => {
    const supabase = req.supabase;
    const user = req.user;

    const { data: enterprise, error } = await supabase
      .from('enterprise')
      .select('id, name, document, email, phone, created_at')
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'enterprise_not_found' });
    }

    return res.json({
      enterprise,
      user: { id: user.id, email: user.email },
    });
  });
}
