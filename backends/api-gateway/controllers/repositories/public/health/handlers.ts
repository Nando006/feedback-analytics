import type { Request, Response } from 'express';

export function getHealthHandler(_req: Request, res: Response) {
  return res.json({ ok: true });
}
