import express from 'express';
import { emailUpdateSchema } from 'lib/schemas/user/emailUpdateSchema';
import { requireAuth } from 'src/server/express/middleware/auth';

export function Email(app: express.Express) {
  app.patch('/api/protected/user/email', requireAuth, async (req, res) => {
    const parsed = emailUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'invalid_payload' });
    }

    const supabase = req.supabase;
    const { data, error } = await supabase.auth.updateUser({
      email: parsed.data.email,
    });

    if (error) {
      return res.status(400).json({ error: 'update_failed' });
    }

    return res.json({
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
    });
  });
}
