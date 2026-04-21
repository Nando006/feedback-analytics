import type { createSupabaseServerClient } from '../config/supabase';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string | null;
        phone?: string | null;
      };
      supabase?: ReturnType<typeof createSupabaseServerClient>;
    }
  }
}

export {};