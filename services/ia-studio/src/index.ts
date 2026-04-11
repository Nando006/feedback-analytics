import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import {
  analyzeFeedbacksForEnterprise,
  IaStudioServiceError,
  type IaStudioOptions,
  type SupabaseServerClient,
} from '../../../apps/backend-gateway/src/server/express/services/iaStudioService.js';
import type {
  IaStudioRemoteRunRequest,
  IaStudioRunResponse,
  IaStudioScopeType,
} from '../../../shared/lib/interfaces/contracts/ia-studio.contract.js';

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function parseScopeType(value: unknown): IaStudioScopeType | undefined {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();

  if (
    normalized === 'COMPANY' ||
    normalized === 'PRODUCT' ||
    normalized === 'SERVICE' ||
    normalized === 'DEPARTMENT'
  ) {
    return normalized;
  }

  return undefined;
}

function parseLimit(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  if (value <= 0) {
    return undefined;
  }

  return Math.floor(value);
}

function parseCatalogItemId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function isInternalRequestAuthorized(req: express.Request): boolean {
  const expectedToken = String(process.env.IA_STUDIO_INTERNAL_TOKEN ?? '').trim();

  if (!expectedToken) {
    return true;
  }

  const providedToken = String(req.get('x-ia-studio-token') ?? '').trim();

  return providedToken.length > 0 && providedToken === expectedToken;
}

function createSupabaseServiceRoleClient(): SupabaseServerClient {
  const supabaseUrl = String(process.env.VITE_SUPABASE_URL ?? '').trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new IaStudioServiceError(
      'Missing Supabase service role configuration',
      500,
      'missing_supabase_service_role_config',
    );
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client as unknown as SupabaseServerClient;
}

function parseIaOptions(body: Partial<IaStudioRemoteRunRequest>): IaStudioOptions | undefined {
  if (!isObject(body.options)) {
    return undefined;
  }

  const limit = parseLimit(body.options.limit);
  const scopeType = parseScopeType(body.options.scope_type);
  const catalogItemId = parseCatalogItemId(body.options.catalog_item_id);

  if (body.options.scope_type !== undefined && !scopeType) {
    throw new IaStudioServiceError('Invalid scope_type', 422, 'invalid_scope_type');
  }

  const hasAnyOption =
    limit !== undefined || scopeType !== undefined || catalogItemId !== undefined;

  if (!hasAnyOption) {
    return undefined;
  }

  return {
    limit,
    scope_type: scopeType,
    catalog_item_id: catalogItemId,
  };
}

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.get('/internal/health', (_req, res) => {
  return res.status(200).json({ ok: true, service: 'ia-studio' });
});

app.get('/internal/ia-studio/health', (_req, res) => {
  return res.status(200).json({ ok: true, service: 'ia-studio' });
});

app.post('/internal/ia-studio/analyze', async (req, res) => {
  if (!isInternalRequestAuthorized(req)) {
    return res.status(401).json({
      error: 'unauthorized_internal_request',
      message: 'Missing or invalid internal token',
    });
  }

  const body = (isObject(req.body)
    ? (req.body as Partial<IaStudioRemoteRunRequest>)
    : {}) satisfies Partial<IaStudioRemoteRunRequest>;

  const userId = typeof body.user_id === 'string' ? body.user_id.trim() : '';

  if (!userId) {
    return res.status(400).json({
      error: 'invalid_payload',
      message: 'user_id is required',
    });
  }

  try {
    const options = parseIaOptions(body);
    const supabase = createSupabaseServiceRoleClient();

    const result = await analyzeFeedbacksForEnterprise({
      supabase,
      userId,
      options,
    });

    return res.status(200).json(result satisfies IaStudioRunResponse);
  } catch (error) {
    if (error instanceof IaStudioServiceError) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
    }

    console.error('[ia-studio] unexpected error:', error);

    return res.status(500).json({
      error: 'internal_server_error',
      message: 'Unexpected error while processing IA analysis',
    });
  }
});

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 4100);

  app.listen(port, () => {
    console.log(`[ia-studio] running at http://localhost:${port}`);
  });
}

export default app;
