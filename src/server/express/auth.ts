// Bloquear acesso a rotas privadas quando não houver usuário autenticado (sessão via cookies httpOnly).

import type { NextFunction, Request, Response } from 'express';
import { createSupabaseServerClient } from './supabase';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const supabase = createSupabaseServerClient(req, res);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  return next();
}
