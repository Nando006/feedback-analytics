import { createServerClient } from '@supabase/ssr';
import type { Request, Response } from 'express';

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const [k, ...v] = part.split('=');
    if (!k) continue;
    out[k.trim()] = decodeURIComponent(v.join('=').trim());
  }
  return out;
}

export function createSupabaseServerClient(
  req: Request,
  res: Response,
  opts?: { remember?: boolean },
) {
  const isProd = process.env.NODE_ENV === 'production';
  // const cookies = parseCookies(req.headers.cookie);

  return createServerClient(
    process.env.VITE_SUPABASE_URL as string,
    process.env.VITE_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          const header = req.get('cookie') ?? '';
          const parsed = parseCookies(header);
          return Object.entries(parsed).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet) {
          const remember = opts?.remember === true;
          const base = {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax' as const,
            path: '/',
            ...(remember ? { maxAge: 60 * 60 * 24 * 30 * 1000 } : {}),
          };
          for (const { name, value, options } of cookiesToSet) {
            res.cookie(name, value, { ...base, ...(options ?? {}) });
          }
        },
      },
    },
  );
}
