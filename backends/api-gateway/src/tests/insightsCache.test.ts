import { describe, it, expect } from 'vitest';
import type { IaAnalyzeFeedbackInput } from '../../../../shared/interfaces/contracts/ia-analyze/input.contract.js';
import {
  countAnalyzedByScope,
  hasFeedbackNewerThanReports,
  reportRowToContext,
  scopeKey,
  type SavedInsightsReport,
} from '../libs/iaAnalyze/insightsCache.js';

function fb(
  createdAt: string | null,
  scopeType: IaAnalyzeFeedbackInput['scope_type'] = 'COMPANY',
  itemId: string | null = null,
): IaAnalyzeFeedbackInput {
  return {
    id: `fb-${createdAt}-${itemId ?? 'none'}`,
    message: 'm',
    rating: 5,
    created_at: createdAt,
    scope_type: scopeType,
    collection_point: null,
    catalog_item: itemId ? { id: itemId, name: 'Item', kind: 'PRODUCT', description: null } : null,
    dynamic_answers: [],
    dynamic_subanswers: [],
  };
}

function report(
  updatedAt: string | null,
  scopeType: SavedInsightsReport['scope_type'] = 'COMPANY',
  itemId: string | null = null,
): SavedInsightsReport {
  return {
    scope_type: scopeType,
    catalog_item_id: itemId,
    catalog_item_name: itemId ? 'Item' : null,
    summary: 'resumo',
    recommendations: ['r1'],
    updated_at: updatedAt,
  };
}

describe('[Unit] insightsCache', () => {
  describe('hasFeedbackNewerThanReports', () => {
    it('true (obsoleto) quando não há relatório salvo', () => {
      expect(hasFeedbackNewerThanReports([fb('2026-01-01T00:00:00Z')], [])).toBe(true);
    });

    it('false (cache válido) quando todo feedback é mais antigo que o relatório', () => {
      expect(
        hasFeedbackNewerThanReports([fb('2026-01-01T00:00:00Z')], [report('2026-02-01T00:00:00Z')]),
      ).toBe(false);
    });

    it('true (obsoleto) quando há feedback mais novo que o relatório', () => {
      expect(
        hasFeedbackNewerThanReports([fb('2026-03-01T00:00:00Z')], [report('2026-02-01T00:00:00Z')]),
      ).toBe(true);
    });

    it('compara contra o relatório MAIS ANTIGO entre os relevantes', () => {
      const reports = [
        report('2026-02-01T00:00:00Z'),
        report('2026-01-01T00:00:00Z', 'PRODUCT', 'p1'),
      ];
      // feedback de 2026-01-15 é mais novo que o relatório mais antigo (01-01) => obsoleto
      expect(hasFeedbackNewerThanReports([fb('2026-01-15T00:00:00Z')], reports)).toBe(true);
    });

    it('true (obsoleto) quando feedback não tem data confiável', () => {
      expect(hasFeedbackNewerThanReports([fb(null)], [report('2026-02-01T00:00:00Z')])).toBe(true);
    });
  });

  describe('countAnalyzedByScope', () => {
    it('conta por scope_type + item de catálogo', () => {
      const counts = countAnalyzedByScope([
        fb('2026-01-01T00:00:00Z', 'COMPANY', null),
        fb('2026-01-02T00:00:00Z', 'COMPANY', null),
        fb('2026-01-03T00:00:00Z', 'PRODUCT', 'p1'),
      ]);
      expect(counts.get(scopeKey('COMPANY', null))).toBe(2);
      expect(counts.get(scopeKey('PRODUCT', 'p1'))).toBe(1);
    });
  });

  describe('reportRowToContext', () => {
    it('reconstrói o contexto com analyzedCount e insights do relatório', () => {
      const ctx = reportRowToContext(report('2026-02-01T00:00:00Z', 'PRODUCT', 'p1'), 7);
      expect(ctx).toMatchObject({
        scope_type: 'PRODUCT',
        catalog_item_id: 'p1',
        analyzedCount: 7,
        globalInsights: { summary: 'resumo', recommendations: ['r1'] },
      });
    });
  });
});
