import type { Request } from 'express';

/**
 * Valida token interno quando configurado no ambiente.
 * Serve para restringir o endpoint interno a chamadas autorizadas do gateway.
 */
export function isInternalRequestAuthorized(req: Request): boolean {
  const expectedToken = String(process.env.IA_ANALYZE_INTERNAL_TOKEN ?? '').trim();

  if (!expectedToken) {
    return true;
  }

  const providedToken = String(req.get('x-ia-analyze-token') ?? '').trim();

  return providedToken.length > 0 && providedToken === expectedToken;
}