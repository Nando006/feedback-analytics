import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import { createSupabaseServerClient } from '../config/supabase.js';
import { makeMockSupabase, TEST_USER, TEST_ENTERPRISE } from './helpers/supabase-mock.js';
import {
  fetchScopedRatingAggregates,
  fetchScopedAnalysisAggregates,
} from '../repositories/feedbackStats.repository.js';

vi.mock('../config/supabase.js', () => ({
  createSupabaseServerClient: vi.fn(),
}));

// As agregações de stats migraram para Drizzle; mockamos o repositório para
// testar o controller sem um banco real.
vi.mock('../repositories/feedbackStats.repository.js', () => ({
  fetchScopedRatingAggregates: vi.fn(),
  fetchScopedAnalysisAggregates: vi.fn(),
}));

const mockCreateClient = vi.mocked(createSupabaseServerClient);
const mockRatingAgg = vi.mocked(fetchScopedRatingAggregates);
const mockAnalysisAgg = vi.mocked(fetchScopedAnalysisAggregates);

function setupAuthenticatedMock() {
  const mockSupabase = makeMockSupabase();
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: TEST_USER },
    error: null,
  });
  mockCreateClient.mockReturnValue(mockSupabase as never);
  return mockSupabase;
}

describe('[Integração] GET /api/protected/user/feedbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 sem autenticação', async () => {
    const mockSupabase = makeMockSupabase();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });
    mockCreateClient.mockReturnValue(mockSupabase as never);

    const res = await request(app).get('/api/protected/user/feedbacks');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('[CT-UC10-01] retorna 200 com paginação padrão quando autenticado', async () => {
    const mockSupabase = setupAuthenticatedMock();

    // enterprise encontrada
    mockSupabase.queryBuilder.single.mockResolvedValueOnce({
      data: TEST_ENTERPRISE,
      error: null,
    });

    // countQuery (await countQuery) → retorna count
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: null, error: null, count: 0 });
      return Promise.resolve({ data: null, error: null, count: 0 });
    });

    // dataQuery (await query.range(...)) → range retorna this, then é chamado
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: [], error: null });
      return Promise.resolve({ data: [], error: null });
    });

    // answers query (await supabase.from('feedback_question_answers')...)
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: [], error: null });
      return Promise.resolve({ data: [], error: null });
    });

    const res = await request(app).get('/api/protected/user/feedbacks');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('feedbacks');
    expect(res.body).toHaveProperty('pagination');
  });

  it('[CT-UC10-02] retorna 404 quando empresa não encontrada', async () => {
    const mockSupabase = setupAuthenticatedMock();

    mockSupabase.queryBuilder.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });

    const res = await request(app).get('/api/protected/user/feedbacks');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('enterprise_not_found');
  });

  it('[CT-UC10-05] retorna 200 com filtro de rating', async () => {
    const mockSupabase = setupAuthenticatedMock();

    mockSupabase.queryBuilder.single.mockResolvedValueOnce({
      data: TEST_ENTERPRISE,
      error: null,
    });

    // countQuery
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: null, error: null, count: 0 });
      return Promise.resolve({ data: null, error: null, count: 0 });
    });

    // dataQuery (via range)
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: [], error: null });
      return Promise.resolve({ data: [], error: null });
    });

    // answers query
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: [], error: null });
      return Promise.resolve({ data: [], error: null });
    });

    const res = await request(app)
      .get('/api/protected/user/feedbacks')
      .query({ rating: 5 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('feedbacks');
  });

  it('[CT-UC10-06] retorna 200 com filtro de categoria COMPANY (sem itens de catálogo)', async () => {
    const mockSupabase = setupAuthenticatedMock();

    mockSupabase.queryBuilder.single.mockResolvedValueOnce({
      data: TEST_ENTERPRISE,
      error: null,
    });

    // collection_points para COMPANY (direto await)
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: [{ id: 'cp-1' }], error: null });
      return Promise.resolve({ data: [{ id: 'cp-1' }], error: null });
    });

    // countQuery
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: null, error: null, count: 2 });
      return Promise.resolve({ data: null, error: null, count: 2 });
    });

    // dataQuery (via range)
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: [], error: null });
      return Promise.resolve({ data: [], error: null });
    });

    // answers query
    mockSupabase.queryBuilder.then.mockImplementationOnce((resolve: (v: unknown) => void) => {
      resolve({ data: [], error: null });
      return Promise.resolve({ data: [], error: null });
    });

    const res = await request(app)
      .get('/api/protected/user/feedbacks')
      .query({ category: 'COMPANY' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('feedbacks');
  });
});

describe('[Integração] GET /api/protected/user/feedbacks/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 sem autenticação', async () => {
    const mockSupabase = makeMockSupabase();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });
    mockCreateClient.mockReturnValue(mockSupabase as never);

    const res = await request(app).get('/api/protected/user/feedbacks/stats');

    expect(res.status).toBe(401);
  });

  it('[CT-UC09-01] retorna 200 com distribuição de ratings (agregação via Drizzle)', async () => {
    const mockSupabase = setupAuthenticatedMock();

    // enterprise encontrada (lookup ainda via Supabase, protegido por RLS)
    mockSupabase.queryBuilder.single.mockResolvedValueOnce({
      data: TEST_ENTERPRISE,
      error: null,
    });

    // Agregados servidos via Drizzle (mockados): notas 5,5,4,3 e nada analisado.
    mockRatingAgg.mockResolvedValueOnce({
      totalFeedbacks: 4,
      ratingSum: 17,
      ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 },
    });
    mockAnalysisAgg.mockResolvedValueOnce({
      totalAnalyzed: 0,
      latestAnalysisAt: null,
      aiCounts: { positive: 0, neutral: 0, negative: 0 },
    });

    const res = await request(app).get('/api/protected/user/feedbacks/stats');

    expect(res.status).toBe(200);
    expect(res.body.totalFeedbacks).toBe(4);
    expect(res.body.averageRating).toBe(4.3); // 17/4 = 4.25 → 4.3
    expect(res.body.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 });
    expect(res.body.pendingCount).toBe(4);
  });

  it('retorna 200 e repassa start_date e end_date corretos para o repositório', async () => {
    const mockSupabase = setupAuthenticatedMock();

    mockSupabase.queryBuilder.single.mockResolvedValueOnce({
      data: TEST_ENTERPRISE,
      error: null,
    });

    mockRatingAgg.mockResolvedValueOnce({
      totalFeedbacks: 0,
      ratingSum: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
    mockAnalysisAgg.mockResolvedValueOnce({
      totalAnalyzed: 0,
      latestAnalysisAt: null,
      aiCounts: { positive: 0, neutral: 0, negative: 0 },
    });

    const res = await request(app)
      .get('/api/protected/user/feedbacks/stats')
      .query({
        start_date: '2026-06-01T00:00:00.000Z',
        end_date: '2026-06-30T23:59:59.999Z',
      });

    expect(res.status).toBe(200);
    expect(mockRatingAgg).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-30T23:59:59.999Z',
      }),
    );
    expect(mockAnalysisAgg).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2026-06-01T00:00:00.000Z',
        endDate: '2026-06-30T23:59:59.999Z',
      }),
    );
  });

  it('retorna 400 se start_date for inválida', async () => {
    setupAuthenticatedMock();

    const res = await request(app)
      .get('/api/protected/user/feedbacks/stats')
      .query({ start_date: 'data-invalida' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });
});

