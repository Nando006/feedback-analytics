import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import { createSupabaseServerClient } from '../config/supabase.js';
import { analyzeRawFeedbacks, regenerateFeedbackInsights } from '../services/iaAnalyze.service.js';
import { IaAnalyzeServiceError } from '../libs/iaAnalyze/errors.js';
import { makeMockSupabase, TEST_USER } from './helpers/supabase-mock.js';

vi.mock('../config/supabase.js', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('../services/iaAnalyze.service.js', () => ({
  analyzeRawFeedbacks: vi.fn(),
  regenerateFeedbackInsights: vi.fn(),
}));

const mockCreateClient = vi.mocked(createSupabaseServerClient);
const mockAnalyzeRawFeedbacks = vi.mocked(analyzeRawFeedbacks);
const mockRegenerateFeedbackInsights = vi.mocked(regenerateFeedbackInsights);

function setupAuthenticatedMock() {
  const mockSupabase = makeMockSupabase();
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: TEST_USER },
    error: null,
  });
  mockCreateClient.mockReturnValue(mockSupabase as never);
  return mockSupabase;
}

describe('POST /api/protected/ia-analyze/analyze-raw', () => {
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

    const res = await request(app)
      .post('/api/protected/ia-analyze/analyze-raw')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized');
  });

  it('[CT-UC11-02] retorna 200 com resultado da análise IA', async () => {
    setupAuthenticatedMock();

    mockAnalyzeRawFeedbacks.mockResolvedValueOnce({
      analyzedCount: 5,
      feedbacksAnalyzed: ['id-1', 'id-2', 'id-3', 'id-4', 'id-5'],
    });

    const res = await request(app)
      .post('/api/protected/ia-analyze/analyze-raw')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.analyzedCount).toBe(5);
  });

  it('[CT-UC11-07] retorna erro tipado quando o serviço IA lança IaAnalyzeServiceError', async () => {
    setupAuthenticatedMock();

    mockAnalyzeRawFeedbacks.mockRejectedValueOnce(
      new IaAnalyzeServiceError('Sem feedbacks suficientes', 422, 'insufficient_feedbacks'),
    );

    const res = await request(app)
      .post('/api/protected/ia-analyze/analyze-raw')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('insufficient_feedbacks');
  });

  it('retorna 500 para erro inesperado do serviço', async () => {
    setupAuthenticatedMock();

    mockAnalyzeRawFeedbacks.mockRejectedValueOnce(new Error('Erro inesperado'));

    const res = await request(app)
      .post('/api/protected/ia-analyze/analyze-raw')
      .send({});

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
  });
});

describe('POST /api/protected/ia-analyze/regenerate-insights', () => {
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

    const res = await request(app)
      .post('/api/protected/ia-analyze/regenerate-insights')
      .send({});

    expect(res.status).toBe(401);
  });

  it('[CT-UC11-04] retorna 200 com insights regenerados', async () => {
    setupAuthenticatedMock();

    mockRegenerateFeedbackInsights.mockResolvedValueOnce({
      regeneratedCount: 3,
      insightsGenerated: ['scope-1', 'scope-2', 'scope-3'],
    });

    const res = await request(app)
      .post('/api/protected/ia-analyze/regenerate-insights')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.regeneratedCount).toBe(3);
  });
});
