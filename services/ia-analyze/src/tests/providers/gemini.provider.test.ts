import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { AnalyzeBatchWithIaParams } from '../../../types/iaApiClient.types.js';

// Mock do SDK do Gemini: createIaApiClient faz `new GoogleGenAI(...)` e usa
// `ai.models.generateContent`. Hoisted para o factory de vi.mock enxergar.
const { mockGenerateContent } = vi.hoisted(() => ({ mockGenerateContent: vi.fn() }));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({ models: { generateContent: mockGenerateContent } })),
}));

import {
  createIaApiClient,
  IaApiClientError,
  isDailyQuotaExceeded,
  isRetryableError,
} from '../../providers/gemini.provider.js';

/** Erro no formato do SDK do Gemini (status numérico + mensagem). */
function geminiError(status: number, message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status });
}

// Mensagens reais do Gemini free-tier: a de cota diária cita a métrica PerDay; a
// de curto prazo cita PerMinute. retryDelay:0s mantém o teste de retry rápido.
const DAILY_QUOTA_MSG =
  '429 RESOURCE_EXHAUSTED: Quota exceeded for metric GenerateRequestsPerDayPerProjectPerModel, limit: 50 per day';
const RPM_QUOTA_MSG =
  '429 RESOURCE_EXHAUSTED: Quota exceeded for metric GenerateRequestsPerMinutePerProjectPerModel. retryDelay: 0s';

const PARAMS: AnalyzeBatchWithIaParams = {
  scopeType: 'COMPANY',
  enterpriseContext: {
    enterprise_name: 'Empresa Teste',
    company_objective: 'Melhorar satisfação',
    analytics_goal: 'Identificar pontos de melhoria',
    business_summary: 'Varejo com foco em atendimento',
    main_products_or_services: ['Produto A'],
  },
  feedbacks: [
    {
      id: 'fb-1',
      message: 'Ótimo atendimento',
      rating: 5,
      created_at: '2026-01-01T00:00:00.000Z',
      scope_type: 'COMPANY',
      collection_point: { id: 'cp-1', name: 'Geral', type: 'QR_CODE', identifier: 'abc' },
      catalog_item: null,
      dynamic_answers: [],
      dynamic_subanswers: [],
    },
  ],
};

const VALID_AI_RESPONSE = {
  text: JSON.stringify({ feedbacks: [], global_insights: { summary: 'ok', recommendations: [] } }),
  candidates: [{ finishReason: 'STOP' }],
};

describe('[Unit] gemini.provider — distinção de cota', () => {
  describe('isDailyQuotaExceeded', () => {
    it('true para 429 com métrica diária (PerDay)', () => {
      expect(isDailyQuotaExceeded(geminiError(429, DAILY_QUOTA_MSG))).toBe(true);
    });

    it('true para "per day"/"daily" mesmo sem status numérico', () => {
      expect(isDailyQuotaExceeded(new Error('RESOURCE_EXHAUSTED: limit reached per day'))).toBe(true);
      expect(isDailyQuotaExceeded(new Error('429 daily quota exceeded'))).toBe(true);
    });

    it('false para rate limit de curto prazo (PerMinute)', () => {
      expect(isDailyQuotaExceeded(geminiError(429, RPM_QUOTA_MSG))).toBe(false);
    });

    it('false para 503/overload e para erros não-quota', () => {
      expect(isDailyQuotaExceeded(geminiError(503, 'The model is overloaded'))).toBe(false);
      expect(isDailyQuotaExceeded(geminiError(400, 'Invalid request'))).toBe(false);
    });
  });

  describe('isRetryableError', () => {
    it('NÃO retenta cota diária (429 PerDay)', () => {
      expect(isRetryableError(geminiError(429, DAILY_QUOTA_MSG))).toBe(false);
    });

    it('retenta rate limit de curto prazo (429 PerMinute)', () => {
      expect(isRetryableError(geminiError(429, RPM_QUOTA_MSG))).toBe(true);
    });

    it('retenta 503/overload e demais 5xx', () => {
      expect(isRetryableError(geminiError(503, 'overloaded'))).toBe(true);
      expect(isRetryableError(geminiError(500, 'internal'))).toBe(true);
      expect(isRetryableError(geminiError(504, 'timeout'))).toBe(true);
    });

    it('NÃO retenta erros de requisição/credencial (4xx não-429)', () => {
      expect(isRetryableError(geminiError(400, 'bad request'))).toBe(false);
      expect(isRetryableError(geminiError(401, 'unauthorized'))).toBe(false);
      expect(isRetryableError(geminiError(404, 'model not found'))).toBe(false);
    });
  });
});

describe('[Unit] gemini.provider — analyzeBatch (retry/backoff)', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('[CT-D-01] cota diária (429 PerDay) falha em 1 tentativa, sem retry', async () => {
    mockGenerateContent.mockRejectedValue(geminiError(429, DAILY_QUOTA_MSG));
    const client = createIaApiClient('fake-key');

    await expect(client.analyzeBatch(PARAMS)).rejects.toBeInstanceOf(IaApiClientError);
    // Sem retry: a cota diária não dispara as MAX_ATTEMPTS tentativas.
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('[CT-D-02] 503/overload ainda é retentado e conclui na 2ª tentativa', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(geminiError(503, 'Service overloaded. retryDelay: 0s'))
      .mockResolvedValueOnce(VALID_AI_RESPONSE);
    const client = createIaApiClient('fake-key');

    const result = await client.analyzeBatch(PARAMS);

    expect(result).toEqual({ feedbacks: [], global_insights: { summary: 'ok', recommendations: [] } });
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });
});
