import { vi, describe, it, expect, beforeEach } from 'vitest';

// Testa o REAL regenerateFeedbackInsights, mockando suas dependências para
// isolar a lógica do cache de leitura. O foco é provar que um cache hit NÃO
// chama o LLM (runIaAnalyzeAnalysis) — o "clicar de novo não gasta cota".
vi.mock('../repositories/iaAnalyze.repository.js', () => ({
  fetchEnterpriseContextForAnalysis: vi.fn(),
  fetchAlreadyAnalyzedFeedbacks: vi.fn(),
  fetchFeedbackInsightsReports: vi.fn(),
  upsertFeedbackInsightsReports: vi.fn(),
  // Exports usados pelo módulo de serviço, irrelevantes para estes testes:
  fetchAlreadyAnalyzedFeedbackIds: vi.fn(),
  fetchFeedbacksForAnalysis: vi.fn(),
  insertFeedbackAnalysisRows: vi.fn(),
}));

vi.mock('../providers/iaAnalyze.provider.js', () => ({
  runIaAnalyzeAnalysis: vi.fn(),
}));

vi.mock('../libs/iaAnalyze/rules.js', () => ({
  hasRequiredEnterpriseInfoForAnalysis: () => true,
  MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS: 1,
}));

vi.mock('../libs/iaAnalyze/filter.js', () => ({
  applyExecutionFilter: (feedbacks: unknown[]) => feedbacks,
}));

vi.mock('../libs/iaAnalyze/build.js', () => ({
  buildEnterpriseContext: () => ({ enterprise_name: 'X' }),
  buildAnalysisBatches: (feedbacks: unknown[]) => [
    { scopeType: 'COMPANY', catalogItemId: null, catalogItemName: null, feedbacks },
  ],
}));

import { regenerateFeedbackInsights } from '../services/iaAnalyze.service.js';
import {
  fetchEnterpriseContextForAnalysis,
  fetchAlreadyAnalyzedFeedbacks,
  fetchFeedbackInsightsReports,
  upsertFeedbackInsightsReports,
} from '../repositories/iaAnalyze.repository.js';
import { runIaAnalyzeAnalysis } from '../providers/iaAnalyze.provider.js';

const mockEnterpriseContext = vi.mocked(fetchEnterpriseContextForAnalysis);
const mockAnalyzedFeedbacks = vi.mocked(fetchAlreadyAnalyzedFeedbacks);
const mockReports = vi.mocked(fetchFeedbackInsightsReports);
const mockUpsert = vi.mocked(upsertFeedbackInsightsReports);
const mockRunIa = vi.mocked(runIaAnalyzeAnalysis);

const SUPA = {} as never;

function fb(createdAt: string) {
  return {
    id: `fb-${createdAt}`,
    message: 'm',
    rating: 5,
    created_at: createdAt,
    scope_type: 'COMPANY',
    collection_point: null,
    catalog_item: null,
    dynamic_answers: [],
    dynamic_subanswers: [],
  };
}

const COMPANY_REPORT = {
  scope_type: 'COMPANY',
  catalog_item_id: null,
  catalog_item_name: null,
  summary: 'resumo cacheado',
  recommendations: ['rec cacheada'],
  updated_at: '2026-02-01T00:00:00.000Z',
};

function iaResult(summary: string) {
  return {
    analyses: [],
    contexts: [
      {
        scope_type: 'COMPANY',
        catalog_item_id: null,
        catalog_item_name: null,
        analyzedCount: 1,
        globalInsights: { summary, recommendations: [] },
      },
    ],
  };
}

describe('[Integração] regenerateFeedbackInsights — cache de insights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnterpriseContext.mockResolvedValue({
      enterpriseId: 'e1',
      collecting: null,
      enterpriseName: 'Empresa',
    });
    // upsert devolve os contextos passados (simula persistência bem-sucedida).
    mockUpsert.mockImplementation(async (params) => params.contexts);
  });

  it('[CT-E-01] cache hit: sem feedback novo, devolve o salvo e NÃO chama o LLM', async () => {
    mockAnalyzedFeedbacks.mockResolvedValue([fb('2026-01-01T00:00:00.000Z')] as never);
    mockReports.mockResolvedValue([COMPANY_REPORT] as never);

    const result = await regenerateFeedbackInsights({
      supabase: SUPA,
      userId: 'u1',
      options: { scope_type: 'COMPANY' },
    });

    expect(mockRunIa).not.toHaveBeenCalled();
    expect(result.fromCache).toBe(true);
    expect(result.reportGenerated).toBe(true);
    expect(result.globalInsights?.summary).toBe('resumo cacheado');
    expect(result.contexts[0]?.analyzedCount).toBe(1);
  });

  it('[CT-E-02] cache miss: feedback novo desde o relatório => chama o LLM', async () => {
    mockAnalyzedFeedbacks.mockResolvedValue([fb('2026-03-01T00:00:00.000Z')] as never);
    mockReports.mockResolvedValue([COMPANY_REPORT] as never);
    mockRunIa.mockResolvedValue(iaResult('novo') as never);

    const result = await regenerateFeedbackInsights({
      supabase: SUPA,
      userId: 'u1',
      options: { scope_type: 'COMPANY' },
    });

    expect(mockRunIa).toHaveBeenCalledTimes(1);
    expect(result.fromCache).toBe(false);
    expect(result.globalInsights?.summary).toBe('novo');
  });

  it('[CT-E-03] force ignora o cache mesmo sem feedback novo (nem consulta o cache)', async () => {
    mockAnalyzedFeedbacks.mockResolvedValue([fb('2026-01-01T00:00:00.000Z')] as never);
    mockReports.mockResolvedValue([COMPANY_REPORT] as never);
    mockRunIa.mockResolvedValue(iaResult('forçado') as never);

    const result = await regenerateFeedbackInsights({
      supabase: SUPA,
      userId: 'u1',
      options: { scope_type: 'COMPANY', force: true },
    });

    expect(mockRunIa).toHaveBeenCalledTimes(1);
    expect(result.fromCache).toBe(false);
    expect(mockReports).not.toHaveBeenCalled();
  });

  it('[CT-E-04] sem relatório salvo: chama o LLM (não há o que cachear)', async () => {
    mockAnalyzedFeedbacks.mockResolvedValue([fb('2026-01-01T00:00:00.000Z')] as never);
    mockReports.mockResolvedValue([] as never);
    mockRunIa.mockResolvedValue(iaResult('primeiro') as never);

    const result = await regenerateFeedbackInsights({
      supabase: SUPA,
      userId: 'u1',
      options: { scope_type: 'COMPANY' },
    });

    expect(mockRunIa).toHaveBeenCalledTimes(1);
    expect(result.fromCache).toBe(false);
  });
});
