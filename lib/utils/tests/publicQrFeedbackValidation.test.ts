import { describe, expect, it } from 'vitest';
import {
  PUBLIC_QR_FEEDBACK_ERRORS,
  getPublicQrFeedbackBaseValidationError,
  parsePublicQrAnswersInput,
  parsePublicQrSubanswersInput,
} from '../publicQrFeedbackValidation';

describe('publicQrFeedbackValidation', () => {
  it('retorna erro de validação base quando enterprise_id está ausente', () => {
    const error = getPublicQrFeedbackBaseValidationError({
      enterprise_id: '',
      rating: 5,
      message: 'Mensagem válida',
    });

    expect(error).toBe(PUBLIC_QR_FEEDBACK_ERRORS.missingEnterpriseId);
  });

  it('retorna erro de validação base quando rating está ausente', () => {
    const error = getPublicQrFeedbackBaseValidationError({
      enterprise_id: '11111111-1111-4111-8111-111111111111',
      rating: 0,
      message: 'Mensagem válida',
    });

    expect(error).toBe(PUBLIC_QR_FEEDBACK_ERRORS.missingRating);
  });

  it('retorna erro de validação base quando mensagem está ausente', () => {
    const error = getPublicQrFeedbackBaseValidationError({
      enterprise_id: '11111111-1111-4111-8111-111111111111',
      rating: 5,
      message: '   ',
    });

    expect(error).toBe(PUBLIC_QR_FEEDBACK_ERRORS.missingMessage);
  });

  it('retorna null na validação base com payload válido', () => {
    const error = getPublicQrFeedbackBaseValidationError({
      enterprise_id: '11111111-1111-4111-8111-111111111111',
      rating: 5,
      message: 'Mensagem válida',
    });

    expect(error).toBeNull();
  });

  it('parseia answers válidos e normaliza answer_value para uppercase', () => {
    const parsed = parsePublicQrAnswersInput(
      JSON.stringify([
        {
          question_id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
          answer_value: 'boa',
        },
        {
          question_id: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
          answer_value: 'otima',
        },
        {
          question_id: 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
          answer_value: 'mediana',
        },
      ]),
    );

    expect(parsed).toEqual([
      {
        question_id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
        answer_value: 'BOA',
      },
      {
        question_id: 'aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
        answer_value: 'OTIMA',
      },
      {
        question_id: 'aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
        answer_value: 'MEDIANA',
      },
    ]);
  });

  it('retorna null no parse de answers quando payload é inválido', () => {
    const parsed = parsePublicQrAnswersInput(
      JSON.stringify([
        {
          question_id: 'aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
          answer_value: 'BOA',
        },
      ]),
    );

    expect(parsed).toBeNull();
  });

  it('retorna array vazio de subanswers quando campo não é informado', () => {
    expect(parsePublicQrSubanswersInput('')).toEqual([]);
  });

  it('retorna null no parse de subanswers quando há IDs duplicados', () => {
    const parsed = parsePublicQrSubanswersInput(
      JSON.stringify([
        {
          subquestion_id: 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
          answer_value: 'BOA',
        },
        {
          subquestion_id: 'bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
          answer_value: 'OTIMA',
        },
      ]),
    );

    expect(parsed).toBeNull();
  });
});
