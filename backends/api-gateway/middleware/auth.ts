// Bloquear acesso a rotas privadas quando não houver usuário autenticado (sessão via cookies httpOnly).

import type { NextFunction, Request, Response } from 'express';
import { createSupabaseServerClient } from '../supabase.js';

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;
type RequestUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: RequestUser;
    supabase?: SupabaseServerClient;
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Criando o cliente Supabase.
  const supabase = createSupabaseServerClient(req, res);
  const { data, error } = await supabase.auth.getUser();

  // Verificando se o usuário está autenticado. Se não estiver, retorna um erro.
  if (error || !data.user) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  // Adicionando o usuário e o cliente Supabase ao request.
  req.user = data.user;
  req.supabase = supabase;

  return next();
}
