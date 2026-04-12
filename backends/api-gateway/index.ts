import express from 'express';
import 'dotenv/config';
import { EndpointsHealth } from './endpoints/public/EndpointHealth.js';
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

function resolveAllowedOrigin(originHeader?: string): string | null {
  if (!originHeader) {
    return null;
  }

  const normalizedOrigin = normalizeOrigin(originHeader);

  if (!normalizedOrigin) {
    return null;
  }

  return allowedOrigins.has(normalizedOrigin) ? normalizedOrigin : null;
}

function corsMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const originHeader =
    typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
  const allowedOrigin = resolveAllowedOrigin(originHeader);

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
EndpointsHealth(app);
EndpointsAuth(app);
EndpointsCallback(app);
EndpointsRegister(app);
EndpointsEnterprisePublic(app);
EndpointsQRCode(app);
EndpointResendConfirmation(app);

// Endpoints Protegidos
EndpointsCollectionPointsQRCode(app);
EndpointsEnterpriseProtected(app);
EndpointsFeedbacks(app);
EndpointsUser(app);
EndpointsIAAnalyze(app);

// Iniciando o servidor.
const port = Number(process.env.PORT ?? 3000);
app.listen(port);
