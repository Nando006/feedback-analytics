import { describe, expect, it } from 'vitest';
import type { FeedbackQuestionPublic } from 'lib/interfaces/contracts/qrcode.contract';
import {
  resolvePublicQrFeedbackScope,
  resolvePublicQrFeedbackScopeFromItemKind,
  resolvePublicQrFeedbackTemplate,
} from '../publicQrFeedbackTemplateEngine';

const companyQuestionsFixture: FeedbackQuestionPublic[] = [
  {
    id: 'q1',
    scope_type: 'COMPANY',
    catalog_item_id: null,
    question_order: 1,
    question_text: 'Pergunta 1',
    subquestions: [],
  },
  {
    id: 'q2',
    scope_type: 'COMPANY',
    catalog_item_id: null,
    question_order: 2,
    question_text: 'Pergunta 2',
    subquestions: [],
  },
  {
    id: 'q3',
    scope_type: 'COMPANY',
    catalog_item_id: null,
    question_order: 3,
    question_text: 'Pergunta 3',
    subquestions: [],
  },
];

describe('publicQrFeedbackTemplateEngine', () => {
  it('resolve escopo por kind quando não há perguntas no payload', () => {
    expect(resolvePublicQrFeedbackScopeFromItemKind('PRODUCT')).toBe('PRODUCT');
    expect(resolvePublicQrFeedbackScopeFromItemKind('SERVICE')).toBe('SERVICE');
    expect(resolvePublicQrFeedbackScopeFromItemKind('DEPARTMENT')).toBe('DEPARTMENT');
    expect(resolvePublicQrFeedbackScopeFromItemKind(null)).toBe('COMPANY');
  });

  it('prioriza escopo único das perguntas quando consistente', () => {
    const scope = resolvePublicQrFeedbackScope({
      itemKind: 'PRODUCT',
      questions: companyQuestionsFixture,
    });

    expect(scope).toBe('COMPANY');
  });

  it('usa kind do item em cenário inconsistente de escopos mistos', () => {
    const mixedQuestions: FeedbackQuestionPublic[] = [
      { ...companyQuestionsFixture[0], scope_type: 'PRODUCT' },
      { ...companyQuestionsFixture[1], scope_type: 'SERVICE' },
      { ...companyQuestionsFixture[2], scope_type: 'DEPARTMENT' },
    ];

    const scope = resolvePublicQrFeedbackScope({
      itemKind: 'SERVICE',
      questions: mixedQuestions,
    });

    expect(scope).toBe('SERVICE');
  });

  it('retorna template base para todos os escopos nesta etapa', () => {
    expect(resolvePublicQrFeedbackTemplate('COMPANY')).toBe('BASE_DYNAMIC_FORM');
    expect(resolvePublicQrFeedbackTemplate('PRODUCT')).toBe('BASE_DYNAMIC_FORM');
    expect(resolvePublicQrFeedbackTemplate('SERVICE')).toBe('BASE_DYNAMIC_FORM');
    expect(resolvePublicQrFeedbackTemplate('DEPARTMENT')).toBe('BASE_DYNAMIC_FORM');
  });
});
