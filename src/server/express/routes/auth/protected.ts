import express from 'express';
import { requireAuth } from '../../middleware/auth';
import { profileUpdateSchema } from '../../../../../lib/schemas/user/profileUpdateSchema';
import { enterpriseUpdateSchema } from 'lib/schemas/user/enterpriseUpdateSchema';

export function registerProtectedAuthRoutes(app: express.Express) {
  // ========= Select

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

  // ========= Atualização

  // Atualiza metadados do usuário (perfil)
  app.patch('/api/user/profile', requireAuth, async (req, res) => {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (parsed.success) {
      return res.status(400).json({
        error: 'invalid_payload',
      });
    }

    const supabase = req.supabase;
    const { data, error } = await supabase.auth.updateUser({
      data: parsed.data,
    });

    if (error) {
      return res.status(400).json({ error: 'update_failed' });
    }

    return res.json({
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          }
        : null,
    });
  });

  // Atualiza dados da empresa do usuário autenticado
  app.patch('/api/user/enterprise', requireAuth, async (req, res) => {
    const parsed = enterpriseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'invalid_payload',
      });
    }

    const supabase = req.supabase;
    const user = req.user;

    const { data: enterprise, error } = await supabase
      .from('enterprise')
      .update(parsed.data)
      .eq('auth_user_id', user.id)
      .select('id, name, document, email, phone, created_at')
      .single();

    if (error) {
      return res.status(401).json({ error: 'Enterprise_not_found' });
    }

    return res.json({
      enterprise,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
}
