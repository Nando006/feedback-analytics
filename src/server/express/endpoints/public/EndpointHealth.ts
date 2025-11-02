import express from 'express';

export function EndpointsHealth(app: express.Express) {
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
}
