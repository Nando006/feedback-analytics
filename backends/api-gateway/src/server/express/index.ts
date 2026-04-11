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


function readAllowedOrigins(): Set<string> {
  const defaults = [
    'http://localhost:5173',
    'http://localhost:4173',
  ];

  const fromEnv = String(process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const publicSiteUrl = String(process.env.PUBLIC_SITE_URL ?? '').trim();

  if (publicSiteUrl.length > 0) {
    fromEnv.push(publicSiteUrl);
  }

  return new Set([...defaults, ...fromEnv]);
}

const allowedOrigins = readAllowedOrigins();

function corsMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const origin = req.headers.origin;

  if (origin&& allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    );
  }

  // Responde preflight cedo para reduzir latência no navegador
  if (req.method === 'OPTIONS') {
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
