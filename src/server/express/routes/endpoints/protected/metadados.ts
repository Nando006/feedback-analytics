import express from 'express';
import { metadadosUpdateSchema } from '../../../../../../lib/schemas/user/metadadosUpdateSchema.js';
import { requireAuth } from '../../../middleware/auth.js';

export function Metadados(app: express.Express) {
  // Atualiza os metadados do usuário.
  app.patch('/api/protected/user/metadados', requireAuth, async (req, res) => {
    const parsed = metadadosUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'invalid_payload',
      });
    }

  const supabase = req.supabase!;
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
}
