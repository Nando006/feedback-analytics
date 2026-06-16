import { describe, it, expect } from 'vitest';
import { mapEditorQuestionsToPublic } from '../mapEditorQuestionsToPublic';
import type { CompanyFeedbackQuestionInput } from 'lib/interfaces/entities/enterprise.entity';

function q(
  order: 1 | 2 | 3,
  text: string,
  is_active = true,
  subs: { order: 1 | 2 | 3; text: string; active?: boolean }[] = [],
): CompanyFeedbackQuestionInput {
  return {
    question_order: order,
    question_text: text,
    is_active,
    subquestions: subs.map((s) => ({
      subquestion_order: s.order,
      subquestion_text: s.text,
      is_active: s.active ?? true,
    })),
  };
}

describe('[Unidade] mapEditorQuestionsToPublic', () => {
  it('descarta perguntas com texto vazio (não vaza placeholders)', () => {
    const out = mapEditorQuestionsToPublic(
      [q(1, 'Como foi o atendimento?'), q(2, '   '), q(3, '')],
      { scopeType: 'COMPANY', activeFromText: false },
    );
    expect(out).toHaveLength(1);
    expect(out[0].question_text).toBe('Como foi o atendimento?');
  });

  it('COMPANY: respeita o toggle is_active (descarta inativas)', () => {
    const out = mapEditorQuestionsToPublic(
      [q(1, 'Pergunta ativa', true), q(2, 'Pergunta inativa', false)],
      { scopeType: 'COMPANY', activeFromText: false },
    );
    expect(out.map((p) => p.question_text)).toEqual(['Pergunta ativa']);
  });

  it('Catálogo (activeFromText): mostra perguntas com texto mesmo com is_active false', () => {
    const out = mapEditorQuestionsToPublic(
      [q(1, 'Pergunta do produto', false)],
      { scopeType: 'PRODUCT', catalogItemId: 'item-1', activeFromText: true },
    );
    expect(out).toHaveLength(1);
    expect(out[0].scope_type).toBe('PRODUCT');
    expect(out[0].catalog_item_id).toBe('item-1');
  });

  it('preenche scope_type e catalog_item_id (null no COMPANY)', () => {
    const out = mapEditorQuestionsToPublic([q(1, 'Pergunta geral')], {
      scopeType: 'COMPANY',
      activeFromText: false,
    });
    expect(out[0].scope_type).toBe('COMPANY');
    expect(out[0].catalog_item_id).toBeNull();
  });

  it('cunha ids sintéticos estáveis para pergunta e subpergunta', () => {
    const out = mapEditorQuestionsToPublic(
      [q(2, 'Pergunta dois', true, [{ order: 1, text: 'Sub um' }])],
      { scopeType: 'COMPANY', activeFromText: false, idPrefix: 'preview-company' },
    );
    expect(out[0].id).toBe('preview-company-q2');
    expect(out[0].subquestions?.[0].id).toBe('preview-company-q2-s1');
    expect(out[0].subquestions?.[0].question_id).toBe('preview-company-q2');
  });

  it('descarta subperguntas vazias e preserva is_active (COMPANY)', () => {
    const out = mapEditorQuestionsToPublic(
      [
        q(1, 'Pergunta', true, [
          { order: 1, text: 'Sub ativa', active: true },
          { order: 2, text: 'Sub inativa', active: false },
          { order: 3, text: '   ', active: true },
        ]),
      ],
      { scopeType: 'COMPANY', activeFromText: false },
    );
    const subs = out[0].subquestions ?? [];
    expect(subs).toHaveLength(2); // a de texto vazio sai
    expect(subs.find((s) => s.subquestion_text === 'Sub ativa')?.is_active).toBe(true);
    expect(subs.find((s) => s.subquestion_text === 'Sub inativa')?.is_active).toBe(false);
  });

  it('Catálogo: subperguntas com texto ficam ativas (is_active=true)', () => {
    const out = mapEditorQuestionsToPublic(
      [q(1, 'Pergunta', false, [{ order: 1, text: 'Sub', active: false }])],
      { scopeType: 'SERVICE', catalogItemId: 'svc-1', activeFromText: true },
    );
    expect(out[0].subquestions?.[0].is_active).toBe(true);
  });
});
