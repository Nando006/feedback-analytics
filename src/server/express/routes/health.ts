import express from 'express';

export function RegisterHealthRoutes(app: express.Express) {
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
}
