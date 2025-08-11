import express from 'express';
import { requireAuth } from './auth';
import { createSupabaseServerClient } from './supabase';
import 'dotenv/config';
import { loginSchema } from '../../../lib/schemas/loginSchema';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/auth/callback', async (req, res) => {
  const supabase = createSupabaseServerClient(req, res);
  await supabase.auth.exchangeCodeForSession(req.url);
  return res.redirect('/user/dashboard');
});

app.post('/api/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  const { email, password, remember } = parsed.data;
  const supabase = createSupabaseServerClient(req, res, { remember });
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  return res.json({ ok: true, user: data.user ?? null });
});

app.get('/api/me', requireAuth, async (req, res) => {
  const supabase = createSupabaseServerClient(req, res);
  const { data } = await supabase.auth.getUser();
  return res.json({ user: data.user });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port);
