import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index.js';

describe('[Integração] GET /api/health', () => {
  it('retorna 200 com { ok: true }', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
