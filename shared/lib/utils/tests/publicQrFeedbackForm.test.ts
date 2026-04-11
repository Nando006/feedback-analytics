import { describe, expect, it } from 'vitest';
import type {
  FeedbackQuestionAnswerInput,
  FeedbackQuestionPublic,
  FeedbackSubquestionAnswerInput,
} from 'lib/interfaces/contracts/qrcode/question.contract';
import {
  filterAnswersForQuestions,
  filterSubanswersForQuestions,
  getActiveSubquestions,
  getItemKindLabel,
  hasAllRequiredAnswers,
  hasAllRequiredSubanswers,
  orderAnswersByQuestions,
  orderSubanswersByQuestions,
} from '../publicQrFeedbackForm';

const questionsFixture: FeedbackQuestionPublic[] = [
  {
    id: 'question-2',
    scope_type: 'COMPANY',
    catalog_item_id: null,
    question_order: 2,
    question_text: 'Pergunta 2',
    subquestions: [
      {
        id: 'sub-2-2',
        question_id: 'question-2',
        subquestion_order: 2,
        subquestion_text: 'Subpergunta 2.2',
        is_active: true,
      },
      {
        id: 'sub-2-1',
        question_id: 'question-2',
        subquestion_order: 1,
        subquestion_text: 'Subpergunta 2.1',
        is_active: true,
      },
    ],
  },
  {
    id: 'question-1',
    scope_type: 'COMPANY',
    catalog_item_id: null,
    question_order: 1,
    question_text: 'Pergunta 1',
    subquestions: [
      {
        id: 'sub-1-1',
        question_id: 'question-1',
        subquestion_order: 1,
        subquestion_text: 'Subpergunta 1.1',
        is_active: false,
      },
      {
        id: 'sub-1-2',
        question_id: 'question-1',
        subquestion_order: 2,
        subquestion_text: 'Subpergunta 1.2',
        is_active: true,
      },
    ],
  },
  {
    id: 'question-3',
    scope_type: 'COMPANY',
    catalog_item_id: null,
    question_order: 3,
    question_text: 'Pergunta 3',
    subquestions: [],
  },
];

describe('publicQrFeedbackForm utils', () => {
  it('filtra respostas para manter somente perguntas válidas do contexto', () => {
    const answers: FeedbackQuestionAnswerInput[] = [
      { question_id: 'question-1', answer_value: 'BOA' },
      { question_id: 'question-2', answer_value: 'OTIMA' },
      { question_id: 'question-3', answer_value: 'RUIM' },
      { question_id: 'question-x', answer_value: 'MEDIANA' },
    ];

    expect(filterAnswersForQuestions(answers, questionsFixture)).toEqual([
      { question_id: 'question-1', answer_value: 'BOA' },
      { question_id: 'question-2', answer_value: 'OTIMA' },
      { question_id: 'question-3', answer_value: 'RUIM' },
    ]);
  });

  it('filtra subrespostas para manter apenas subperguntas ativas', () => {
    const subanswers: FeedbackSubquestionAnswerInput[] = [
      { subquestion_id: 'sub-1-1', answer_value: 'BOA' },
      { subquestion_id: 'sub-1-2', answer_value: 'OTIMA' },
      { subquestion_id: 'sub-2-1', answer_value: 'RUIM' },
      { subquestion_id: 'sub-2-2', answer_value: 'PESSIMO' },
      { subquestion_id: 'sub-x', answer_value: 'MEDIANA' },
    ];

    expect(filterSubanswersForQuestions(subanswers, questionsFixture)).toEqual([
      { subquestion_id: 'sub-1-2', answer_value: 'OTIMA' },
      { subquestion_id: 'sub-2-1', answer_value: 'RUIM' },
      { subquestion_id: 'sub-2-2', answer_value: 'PESSIMO' },
    ]);
  });

  it('valida respostas obrigatórias e subrespostas obrigatórias', () => {
    const validAnswers: FeedbackQuestionAnswerInput[] = [
      { question_id: 'question-1', answer_value: 'BOA' },
      { question_id: 'question-2', answer_value: 'OTIMA' },
      { question_id: 'question-3', answer_value: 'RUIM' },
    ];

    const validSubanswers: FeedbackSubquestionAnswerInput[] = [
      { subquestion_id: 'sub-1-2', answer_value: 'OTIMA' },
      { subquestion_id: 'sub-2-1', answer_value: 'RUIM' },
      { subquestion_id: 'sub-2-2', answer_value: 'PESSIMO' },
    ];

    expect(hasAllRequiredAnswers(validAnswers, questionsFixture)).toBe(true);
    expect(hasAllRequiredSubanswers(validSubanswers, questionsFixture)).toBe(true);

    expect(hasAllRequiredAnswers(validAnswers.slice(0, 2), questionsFixture)).toBe(false);
    expect(
      hasAllRequiredSubanswers(validSubanswers.slice(0, 2), questionsFixture),
    ).toBe(false);
  });

  it('ordena respostas e subrespostas pela ordem configurada de perguntas', () => {
    const answers: FeedbackQuestionAnswerInput[] = [
      { question_id: 'question-3', answer_value: 'RUIM' },
      { question_id: 'question-2', answer_value: 'OTIMA' },
      { question_id: 'question-1', answer_value: 'BOA' },
    ];

    const subanswers: FeedbackSubquestionAnswerInput[] = [
      { subquestion_id: 'sub-2-2', answer_value: 'PESSIMO' },
      { subquestion_id: 'sub-2-1', answer_value: 'RUIM' },
      { subquestion_id: 'sub-1-2', answer_value: 'OTIMA' },
    ];

    expect(orderAnswersByQuestions(answers, questionsFixture)).toEqual([
      { question_id: 'question-1', answer_value: 'BOA' },
      { question_id: 'question-2', answer_value: 'OTIMA' },
      { question_id: 'question-3', answer_value: 'RUIM' },
    ]);

    expect(orderSubanswersByQuestions(subanswers, questionsFixture)).toEqual([
      { subquestion_id: 'sub-1-2', answer_value: 'OTIMA' },
      { subquestion_id: 'sub-2-1', answer_value: 'RUIM' },
      { subquestion_id: 'sub-2-2', answer_value: 'PESSIMO' },
    ]);
  });

  it('retorna subperguntas ativas ordenadas e mapeia label de tipo', () => {
    expect(getActiveSubquestions(questionsFixture).map((item) => item.id)).toEqual([
      'sub-1-2',
      'sub-2-1',
      'sub-2-2',
    ]);

    expect(getItemKindLabel('PRODUCT')).toBe('Produto');
    expect(getItemKindLabel('SERVICE')).toBe('Serviço');
    expect(getItemKindLabel('DEPARTMENT')).toBe('Departamento');
    expect(getItemKindLabel(null)).toBeNull();
  });
});
