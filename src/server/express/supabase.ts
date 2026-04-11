import { createServerClient } from '@supabase/ssr';
import type { Request, Response } from 'express';

// Função para parsear as cookies. Utilizada para obter os cookies do request.
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

// Função para criar o cliente Supabase. Utilizada para autenticar o usuário.
export function createSupabaseServerClient(
  req: Request,
  res: Response,
  opts?: { remember?: boolean },
) {
  const isProd = process.env.NODE_ENV === 'production';
  const crossSiteCookie = String(process.env.COOKIE_CROSS_SITE ?? '').trim() === 'true';

  // Em ambientes cruzados (web e api em subdomínios diferentes da Vercel),
  // use SameSite=None + Secure para o browser aceitar o cookie de sessão.
  const sameSite: 'lax' | 'none' =
    isProd && crossSiteCookie ? 'none' : 'lax';

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
          if (res.headersSent || res.writableEnded) {
            return;
          }

          const remember = opts?.remember === true;
          const base = {
            httpOnly: true,
            secure: sameSite === 'none' ? true : isProd,
            sameSite,
            path: '/',
            ...(remember ? { maxAge: 60 * 60 * 24 * 30 * 1000 } : {}),
          };

          for (const { name, value, options } of cookiesToSet) {
            // Primeiro mantém o que o Supabase trouxe (expires, maxAge, etc.),
            // depois força política de segurança definida pela API.
            const mergedOptions = {
              ...(options ?? {}),
              ...base,
            };

            // Em cross-site, garantimos explicitamente os dois atributos.
            if (sameSite === 'none') {
              mergedOptions.sameSite = 'none';
              mergedOptions.secure = true;
            }

            res.cookie(name, value, mergedOptions);
          }
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}