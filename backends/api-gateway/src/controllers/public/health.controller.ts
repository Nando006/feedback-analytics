import type { Request, Response } from 'express';

export function getHealthController(_req: Request, res: Response) {
  return res.json({ ok: true });
}
