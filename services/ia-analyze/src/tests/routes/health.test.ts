import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index.js';

describe('GET /internal/health', () => {
  it('retorna 200 com { ok: true }', async () => {
    const res = await request(app).get('/internal/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, service: 'ia-analyze' });
  });
});

describe('GET /internal/ia-analyze/health', () => {
  it('retorna 200 com { ok: true }', async () => {
    const res = await request(app).get('/internal/ia-analyze/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, service: 'ia-analyze' });
  });
});
