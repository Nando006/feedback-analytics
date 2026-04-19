import express from 'express';
import 'dotenv/config';
import healthRoutes from './routes/public/health.routes.js';
import { EndpointsAuth } from './endpoints/public/EndpointsAuth.js';
import { EndpointsCallback } from './endpoints/public/EndpointsCallback.js';
import { EndpointsRegister } from './endpoints/public/EndpointsRegister.js';
import { EndpointsEnterprise as EndpointsEnterprisePublic } from './endpoints/public/EndpointsEnterprise.js';
import { EndpointsQRCode } from './endpoints/public/EndpointsQRCode.js';
import { EndpointsEnterprise as EndpointsEnterpriseProtected } from './endpoints/protected/EndpointsEnterprise.js';
import { EndpointsCollectionPointsQRCode } from './endpoints/protected/EndpointsCollectionPointsQRCode.js';
import { EndpointsFeedbacks } from './endpoints/protected/EndpointsFeedbacks.js';
import { EndpointsUser } from './endpoints/protected/EndpointsUser.js';
import { EndpointsIAAnalyze } from './endpoints/protected/EndpointsIAAnalyze.js';
import { EndpointResendConfirmation } from './endpoints/public/EndpointResendConfirmation.js';
import { EndpointsForgotPassword } from './endpoints/public/EndpointsForgotPassword.js';

function normalizeOrigin(rawValue: string): string | null {
  const value = String(rawValue ?? '').trim();

  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function normalizeHost(rawValue: string): string | null {
  const value = String(rawValue ?? '').trim().toLowerCase();

  if (!value) {
    return null;
  }

  try {
    return new URL(`http://${value}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function extractVercelProjectSuffix(hostname: string, projectSlug: string): string | null {
  const normalizedHostname = String(hostname ?? '').trim().toLowerCase();
  const normalizedProjectSlug = String(projectSlug ?? '').trim().toLowerCase();

  if (!normalizedHostname || !normalizedProjectSlug) {
    return null;
  }

  const productionHostname = `${normalizedProjectSlug}.vercel.app`;

  if (normalizedHostname === productionHostname) {
    return '.vercel.app';
  }

  if (
    normalizedHostname.startsWith(`${normalizedProjectSlug}-`) &&
    normalizedHostname.endsWith('.vercel.app')
  ) {
    return normalizedHostname.slice(normalizedProjectSlug.length);
  }

  return null;
}

function isVercelProjectHostname(hostname: string, projectSlug: string): boolean {
  return extractVercelProjectSuffix(hostname, projectSlug) !== null;
}

function readVercelPairConfig() {
  const rawEnabled = String(process.env.CORS_ALLOW_VERCEL_PROJECT_PAIR ?? '')
    .trim()
    .toLowerCase();
  const vercelEnv = String(process.env.VERCEL_ENV ?? '')
    .trim()
    .toLowerCase();
  const enabled =
    rawEnabled === 'true' || (rawEnabled !== 'false' && vercelEnv === 'preview');

  return {
    enabled,
    webProjectSlug: String(
      process.env.CORS_VERCEL_WEB_PROJECT_SLUG ?? 'feedback-analytics-web',
    )
      .trim()
      .toLowerCase(),
    apiProjectSlug: String(
      process.env.CORS_VERCEL_API_PROJECT_SLUG ?? 'feedback-analytics-api',
    )
      .trim()
      .toLowerCase(),
  };
}

function readAllowedOrigins(): Set<string> {
  const defaults = ['http://localhost:5173', 'http://localhost:4173']
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => value !== null);

  const fromEnv = String(process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => value !== null);

  const publicSiteOrigin = normalizeOrigin(
    String(process.env.PUBLIC_SITE_URL ?? ''),
  );

  if (publicSiteOrigin) {
    fromEnv.push(publicSiteOrigin);
  }

  return new Set([...defaults, ...fromEnv]);
}

const allowedOrigins = readAllowedOrigins();
const vercelPairConfig = readVercelPairConfig();

function isAllowedByVercelProjectPair(params: {
  origin: string;
  requestHostHeader?: string;
}) {
  if (!vercelPairConfig.enabled) {
    return false;
  }

  const originHostname = normalizeHost(new URL(params.origin).hostname);
  const requestHostname = normalizeHost(String(params.requestHostHeader ?? ''));

  if (!originHostname || !requestHostname) {
    return false;
  }

  const webSuffix = extractVercelProjectSuffix(
    originHostname,
    vercelPairConfig.webProjectSlug,
  );
  const apiSuffix = extractVercelProjectSuffix(
    requestHostname,
    vercelPairConfig.apiProjectSlug,
  );

  // Caso ideal: ambos os projetos compartilham o mesmo sufixo de preview (mesma branch/alias).
  if (webSuffix !== null && apiSuffix !== null && webSuffix === apiSuffix) {
    return true;
  }

  // Fallback: alguns aliases de preview variam entre projetos (ex.: -nando006 vs -git-homolog).
  // Ainda assim, permitimos se origem e host pertencem aos slugs configurados de web/api.
  return (
    isVercelProjectHostname(originHostname, vercelPairConfig.webProjectSlug) &&
    isVercelProjectHostname(requestHostname, vercelPairConfig.apiProjectSlug)
  );
}

function resolveAllowedOrigin(params: {
  originHeader?: string;
  requestHostHeader?: string;
}): string | null {
  const { originHeader, requestHostHeader } = params;

  if (!originHeader) {
    return null;
  }

  const normalizedOrigin = normalizeOrigin(originHeader);

  if (!normalizedOrigin) {
    return null;
  }

  if (allowedOrigins.has(normalizedOrigin)) {
    return normalizedOrigin;
  }

  if (
    isAllowedByVercelProjectPair({
      origin: normalizedOrigin,
      requestHostHeader,
    })
  ) {
    return normalizedOrigin;
  }

  return null;
}

function corsMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const originHeader =
    typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  const requestHostHeader =
    typeof req.headers.host === 'string' ? req.headers.host : undefined;
  const allowedOrigin = resolveAllowedOrigin({
    originHeader,
    requestHostHeader,
  });

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin, Access-Control-Request-Headers');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    const requestedHeaders = req.headers['access-control-request-headers'];
    res.setHeader(
      'Access-Control-Allow-Headers',
      typeof requestedHeaders === 'string' && requestedHeaders.trim().length > 0
        ? requestedHeaders
        : 'Content-Type, Authorization',
    );

    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );

    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Responde preflight cedo para reduzir latência no navegador
  if (req.method === 'OPTIONS') {
    if (originHeader && !allowedOrigin) {
      return res.status(403).end();
    }

    return res.status(204).end();
  }

  return next();
}

// Criando o servidor.
const app = express();

// CORS precisa vir antes dos endpoints
app.use(corsMiddleware);

app.use(express.json());

// Suporte a application/x-www-form-urlencoded (formularios)
app.use(express.urlencoded({ extended: true }));

// Configurando o proxy.
app.set('trust proxy', 1);

// Endpoints Públicos
app.use('/api', healthRoutes);
EndpointsAuth(app);
EndpointsCallback(app);
EndpointsRegister(app);
EndpointsEnterprisePublic(app);
EndpointsQRCode(app);
EndpointResendConfirmation(app);
EndpointsForgotPassword(app);

// Endpoints Protegidos
EndpointsCollectionPointsQRCode(app);
EndpointsEnterpriseProtected(app);
EndpointsFeedbacks(app);
EndpointsUser(app);
EndpointsIAAnalyze(app);

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port);
}

export default app;
