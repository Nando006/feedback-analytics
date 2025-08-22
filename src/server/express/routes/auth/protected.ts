import express from 'express';
import { requireAuth } from '../../middleware/auth';
import { profileUpdateSchema } from '../../../../../lib/schemas/user/profileUpdateSchema';
import { enterpriseUpdateSchema } from '../../../../../lib/schemas/user/enterpriseUpdateSchema';

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

  // ========= Atualização

  // Atualiza metadados do usuário (perfil)
  app.patch('/api/user/profile', requireAuth, async (req, res) => {
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
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
    } catch {}

    return res.json({
      enterprise,
      user: {
        id: user.id,
        email: user.email ?? null,
        phone: user.phone ?? null,
      },
    });
  });

  // Inicia verificação de telefone (envia OTP via SMS)
  app.post('/api/user/phone/start', requireAuth, async (req, res) => {
    const phone = String(req.body?.phone ?? '');
    if(!phone) return res.status(400).json({ error: 'invalid_payload' });

    const supabase = req.supabase;
    const { error } = await supabase.auth.updateUser({ phone });
    if(error) return res.status(400).json({ error: 'update_failed' });
    return res.json({ ok: true });
  });

  // Confirma verificação de telefone (confirma OTP) 
  app.post('/api/user/phone/verify', requireAuth, async (req, res) => {
    const token = String(req.body?.token ?? '');
    if(!token) return res.status(400).json({ error: 'invalid_payload' });

    const supabase = req.supabase;
    const { error } = await supabase.auth.verifyOtp({
      type: 'phone_change',
      token
    });
    if(error) return res.status(400).json({ error: 'verify_failed' });
    return res.json({ ok: true });
  });
}
