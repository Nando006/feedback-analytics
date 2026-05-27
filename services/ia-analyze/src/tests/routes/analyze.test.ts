import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../index.js';
import { runIaAnalyzeService, IaAnalyzeServiceError } from '../../services/iaAnalyze.service.js';

vi.mock('../../services/iaAnalyze.service.js', () => ({
  runIaAnalyzeService: vi.fn(),
  IaAnalyzeServiceError: class IaAnalyzeServiceError extends Error {
    public statusCode: number;
    public code: string;
    constructor(message: string, statusCode: number, code: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
    }
  },
}));

const mockRunService = vi.mocked(runIaAnalyzeService);

const INTERNAL_TOKEN = 'test-internal-token';

const VALID_PAYLOAD = {
  enterprise_context: {
    company_objective: 'Melhorar satisfação do cliente',
    analytics_goal: 'Identificar pontos de melhoria',
    business_summary: 'Empresa de varejo com foco em atendimento',
    main_products_or_services: ['Produto A'],
  },
  batches: [
    {
      scope_type: 'COMPANY',
      catalog_item_id: null,
      catalog_item_name: null,
      feedbacks: [
        {
          id: 'fb-uuid-1',
          message: 'Ótimo atendimento e produto de qualidade',
          rating: 5,
          created_at: new Date().toISOString(),
          scope_type: 'COMPANY',
          collection_point: 'qrcode_geral',
          catalog_item: null,
          dynamic_answers: [],
          dynamic_subanswers: [],
        },
      ],
    },
  ],
};

describe('[Integração] POST /internal/ia-analyze/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 401 sem token interno', async () => {
    const res = await request(app)
      .post('/internal/ia-analyze/analyze')
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized_internal_request');
  });

  it('retorna 401 com token incorreto', async () => {
    const res = await request(app)
      .post('/internal/ia-analyze/analyze')
      .set('x-ia-analyze-token', 'token-errado')
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthorized_internal_request');
  });

  it('retorna 400 com payload inválido (sem enterprise_context)', async () => {
    const res = await request(app)
      .post('/internal/ia-analyze/analyze')
      .set('x-ia-analyze-token', INTERNAL_TOKEN)
      .send({ batches: [] });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('retorna 400 com payload inválido (sem batches)', async () => {
    const res = await request(app)
      .post('/internal/ia-analyze/analyze')
      .set('x-ia-analyze-token', INTERNAL_TOKEN)
      .send({ enterprise_context: VALID_PAYLOAD.enterprise_context });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid_payload');
  });

  it('[CT-UC11-02] retorna 200 com análises e contextos (Gemini mockado)', async () => {
    const mockResult = {
      analyses: [
        {
          feedback_id: 'fb-uuid-1',
          sentiment: 'positive',
          keywords: ['atendimento', 'qualidade'],
          categories: ['servico'],
        },
      ],
      contexts: [
        {
          scope_type: 'COMPANY',
          catalog_item_id: null,
          catalog_item_name: null,
          analyzedCount: 1,
          globalInsights: {
            summary: 'Feedback positivo sobre atendimento',
            recommendations: ['Manter padrão de atendimento'],
          },
        },
      ],
    };

    mockRunService.mockResolvedValueOnce(mockResult);

    const res = await request(app)
      .post('/internal/ia-analyze/analyze')
      .set('x-ia-analyze-token', INTERNAL_TOKEN)
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(200);
    expect(res.body.analyses).toHaveLength(1);
    expect(res.body.analyses[0].sentiment).toBe('positive');
    expect(res.body.contexts).toHaveLength(1);
  });

  it('batch vazio retorna 200 com 0 análises', async () => {
    mockRunService.mockResolvedValueOnce({ analyses: [], contexts: [] });

    const res = await request(app)
      .post('/internal/ia-analyze/analyze')
      .set('x-ia-analyze-token', INTERNAL_TOKEN)
      .send({ ...VALID_PAYLOAD, batches: [] });

    expect(res.status).toBe(200);
    expect(res.body.analyses).toHaveLength(0);
  });

  it('retorna 502 quando Gemini falha (IaAnalyzeServiceError)', async () => {
    mockRunService.mockRejectedValueOnce(
      new IaAnalyzeServiceError('Falha ao chamar IA', 502, 'failed_ia_request'),
    );

    const res = await request(app)
      .post('/internal/ia-analyze/analyze')
      .set('x-ia-analyze-token', INTERNAL_TOKEN)
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('failed_ia_request');
  });

  it('retorna 500 para erro inesperado', async () => {
    mockRunService.mockRejectedValueOnce(new Error('Erro inesperado'));

    const res = await request(app)
      .post('/internal/ia-analyze/analyze')
      .set('x-ia-analyze-token', INTERNAL_TOKEN)
      .send(VALID_PAYLOAD);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('internal_server_error');
  });
});
