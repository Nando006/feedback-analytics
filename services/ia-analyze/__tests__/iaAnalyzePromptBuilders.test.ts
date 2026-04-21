import { describe, it, expect } from 'vitest';
import { buildIaPromptByScope } from '../src/lib/iaAnalyzePromptBuilders.js';
import type { IaAnalyzeFeedbackInput, IaAnalyzeEnterpriseContext } from '../../../shared/interfaces/contracts/ia-analyze/input.contract.js';

const enterpriseContext: IaAnalyzeEnterpriseContext = {
  enterprise_name: 'Empresa Teste',
  company_objective: 'Melhorar satisfacao dos clientes',
  analytics_goal: 'Identificar pontos de melhoria',
  business_summary: 'Empresa de servicos',
  main_products_or_services: ['Suporte', 'Consultoria'],
};

const baseFeedback: IaAnalyzeFeedbackInput = {
  id: 'feedback-001',
  message: 'O atendimento foi rapido mas o produto chegou danificado.',
  rating: 3,
  created_at: '2026-04-19T10:00:00Z',
  scope_type: 'COMPANY',
  collection_point: null,
  catalog_item: null,
  dynamic_answers: [],
  dynamic_subanswers: [],
};

describe('buildIaPromptByScope', () => {
  describe('formato do payload gerado', () => {
    it('deve usar "rating_star" no payload em vez de "rating"', () => {
      const prompt = buildIaPromptByScope({
        scopeType: 'COMPANY',
        enterpriseContext,
        feedbacks: [baseFeedback],
      });

      expect(prompt).toContain('"rating_star"');
      expect(prompt).not.toContain('"rating":');
    });

    it('deve mapear dynamic_answers para { question, score, label }', () => {
      const feedback: IaAnalyzeFeedbackInput = {
        ...baseFeedback,
        dynamic_answers: [
          {
            question_id: 'q1',
            question_text_snapshot: 'Como foi o atendimento?',
            answer_value: 'RUIM',
            answer_score: 2,
          },
        ],
      };

      const prompt = buildIaPromptByScope({
        scopeType: 'COMPANY',
        enterpriseContext,
        feedbacks: [feedback],
      });

      expect(prompt).toContain('"question"');
      expect(prompt).toContain('"score"');
      expect(prompt).toContain('"label"');
      expect(prompt).toContain('Como foi o atendimento?');
      expect(prompt).toContain('"score":2');
      expect(prompt).toContain('"label":"RUIM"');
      expect(prompt).not.toContain('"question_text_snapshot"');
      expect(prompt).not.toContain('"answer_score"');
      expect(prompt).not.toContain('"answer_value"');
    });

    it('deve mapear dynamic_subanswers para { question, score, label }', () => {
      const feedback: IaAnalyzeFeedbackInput = {
        ...baseFeedback,
        dynamic_subanswers: [
          {
            subquestion_id: 'sq1',
            subquestion_text_snapshot: 'A equipe foi atenciosa?',
            answer_value: 'OTIMA',
            answer_score: 5,
          },
        ],
      };

      const prompt = buildIaPromptByScope({
        scopeType: 'SERVICE',
        enterpriseContext,
        feedbacks: [feedback],
      });

      expect(prompt).toContain('A equipe foi atenciosa?');
      expect(prompt).toContain('"score":5');
      expect(prompt).toContain('"label":"OTIMA"');
      expect(prompt).not.toContain('"subquestion_text_snapshot"');
    });

    it('deve incluir o id do feedback no payload', () => {
      const prompt = buildIaPromptByScope({
        scopeType: 'COMPANY',
        enterpriseContext,
        feedbacks: [baseFeedback],
      });

      expect(prompt).toContain('feedback-001');
    });
  });

  describe('regras de sentimento no prompt', () => {
    it('deve conter a secao de regras de sentimento', () => {
      const prompt = buildIaPromptByScope({
        scopeType: 'COMPANY',
        enterpriseContext,
        feedbacks: [baseFeedback],
      });

      expect(prompt).toContain('Regras de SENTIMENTO');
    });

    it('deve indicar dynamic_answers como sinal primario de sentimento', () => {
      const prompt = buildIaPromptByScope({
        scopeType: 'COMPANY',
        enterpriseContext,
        feedbacks: [baseFeedback],
      });

      expect(prompt).toContain('SINAL PRIMARIO');
    });

    it('deve indicar rating_star como sinal secundario', () => {
      const prompt = buildIaPromptByScope({
        scopeType: 'COMPANY',
        enterpriseContext,
        feedbacks: [baseFeedback],
      });

      expect(prompt).toContain('VALIDACAO SECUNDARIA');
    });
  });

  describe('instrucoes por escopo', () => {
    it('deve incluir instrucao de atendimento para escopo COMPANY', () => {
      const prompt = buildIaPromptByScope({
        scopeType: 'COMPANY',
        enterpriseContext,
        feedbacks: [baseFeedback],
      });

      expect(prompt).toContain('COMPANY');
      expect(prompt).toContain('atendimento');
    });

    it('deve incluir instrucao de qualidade para escopo PRODUCT', () => {
      const feedback = { ...baseFeedback, scope_type: 'PRODUCT' as const };
      const prompt = buildIaPromptByScope({
        scopeType: 'PRODUCT',
        enterpriseContext,
        feedbacks: [feedback],
      });

      expect(prompt).toContain('PRODUCT');
      expect(prompt).toContain('qualidade');
    });

    it('deve incluir instrucao de tempo de resposta para escopo SERVICE', () => {
      const feedback = { ...baseFeedback, scope_type: 'SERVICE' as const };
      const prompt = buildIaPromptByScope({
        scopeType: 'SERVICE',
        enterpriseContext,
        feedbacks: [feedback],
      });

      expect(prompt).toContain('SERVICE');
      expect(prompt).toContain('tempo de resposta');
    });

    it('deve incluir instrucao de processo interno para escopo DEPARTMENT', () => {
      const feedback = { ...baseFeedback, scope_type: 'DEPARTMENT' as const };
      const prompt = buildIaPromptByScope({
        scopeType: 'DEPARTMENT',
        enterpriseContext,
        feedbacks: [feedback],
      });

      expect(prompt).toContain('DEPARTMENT');
      expect(prompt).toContain('processo interno');
    });
  });
});
