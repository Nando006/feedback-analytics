import express from 'express';
import { enterpriseUpdateSchema } from 'lib/schemas/user/enterpriseUpdateSchema';
import { requireAuth } from 'src/server/express/middleware/auth';

export function Enterprise(app: express.Express) {
  // Busca os dados da empresa.
  app.get('/api/protected/user/enterprise', requireAuth, async (req, res) => {
    const supabase = req.supabase!;
    const user = req.user!;

    const { data: enterprise, error } = await supabase
      .from('enterprise')
      .select(
        'id, document, account_type, terms_version, terms_accepted_at, created_at',
      )
      .eq('auth_user_id', user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'enterprise_not_found' });
    }

    return res.json({
      enterprise,
      user: {
        id: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
      },
    });
  });

  // Atualiza os dados da empresa.
  app.patch('/api/protected/user/enterprise', requireAuth, async (req, res) => {
    const parsed = enterpriseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'invalid_payload',
      });
    }

    const supabase = req.supabase!;
    const user = req.user!;

    const { data: enterprise, error } = await supabase
      .from('enterprise')
      .update(parsed.data)
      .eq('auth_user_id', user.id)
      .select(
        'id, document, account_type, terms_version, terms_accepted_at, created_at',
      )
      .single();

    if (error) {
      return res.status(401).json({ error: 'Enterprise_not_found' });
    }

    try {
      await supabase.auth.updateUser({
        data: {
          phone: null,
          document: null,
          account_type: null,
          terms_version: null,
          terms_accepted_at: null,
          email: null,
          email_verified: null,
          phone_verified: null,
        },
      });
    } catch (_err) {
      void _err;
    }

    return res.json({
      enterprise,
      user: {
        id: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
      },
    });
  });
}
