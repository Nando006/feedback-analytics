/**
 * Arquivo de entrada HTTP do servico ia-analyze.
 * Centraliza os endpoints internos de health e analise,
 * valida autorizacao e payload, e delega a execucao para o motor de IA.
 */

import 'dotenv/config';
import express from 'express';
import { IaAnalyzeServiceError, runIaAnalyzeEngine } from './iaAnalyzeEngine.js';
import { isInternalRequestAuthorized } from '../lib/isInternalRequestAuthorized.js';
import { isValidRemotePayload } from '../lib/isValidRemotePayload.js';
import type { IaAnalyzeRemoteRunResponse } from '../../../shared/lib/interfaces/contracts/ia-analyze/remote.contract.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.get('/internal/health', (_req, res) => {
  return res.status(200).json({ ok: true, service: 'ia-analyze' });
});

app.get('/internal/ia-analyze/health', (_req, res) => {
  return res.status(200).json({ ok: true, service: 'ia-analyze' });
});

app.post('/internal/ia-analyze/analyze', async (req, res) => {
  if (!isInternalRequestAuthorized(req)) {
    return res.status(401).json({
      error: 'unauthorized_internal_request',
      message: 'Missing or invalid internal token',
    });
  }

  const body = req.body;

  if (!isValidRemotePayload(body)) {
    return res.status(400).json({
      error: 'invalid_payload',
      message: 'enterprise_context and batches are required',
    });
  }

  try {
    const result = await runIaAnalyzeEngine(body);

    return res.status(200).json(result satisfies IaAnalyzeRemoteRunResponse);
  } catch (error) {
    if (error instanceof IaAnalyzeServiceError) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message,
      });
    }

    console.error('[ia-analyze] unexpected error:', error);

    return res.status(500).json({
      error: 'internal_server_error',
      message: 'Unexpected error while processing IA analysis',
    });
  }
});

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 4100);

  app.listen(port, () => {
    console.log(`[ia-analyze] running at http://localhost:${port}`);
  });
}

export default app;
