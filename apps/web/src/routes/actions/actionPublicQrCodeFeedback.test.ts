import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionFunctionArgs } from 'react-router-dom';
import { ActionPublicQrCodeFeedback } from './actionPublicQrCodeFeedback';
import { ServiceSubmitQrcodeFeedback } from 'src/services/serviceFeedbackQRCode';

vi.mock('src/services/serviceFeedbackQRCode', () => ({
  ServiceSubmitQrcodeFeedback: vi.fn(),
}));

const mockServiceSubmitQrcodeFeedback = vi.mocked(ServiceSubmitQrcodeFeedback);

const defaultAnswers = [
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
] as const;

function createRequest(body: Record<string, string | undefined>) {
  const formData = new URLSearchParams();

  Object.entries(body).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      formData.append(key, value);
    }
  });

  return new Request('http://localhost/feedback/qrcode', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });
}

function createArgs(body: Record<string, string | undefined>): ActionFunctionArgs {
  return {
    request: createRequest(body),
    params: {},
    context: undefined,
  };
}

describe('ActionPublicQrCodeFeedback', () => {
  beforeEach(() => {
    mockServiceSubmitQrcodeFeedback.mockReset();
  });

  it('envia collection_point_id e catalog_item_id no payload do serviço', async () => {
    mockServiceSubmitQrcodeFeedback.mockResolvedValue({
      ok: true,
      id: 'feedback-1',
    });

    const response = await ActionPublicQrCodeFeedback(
      createArgs({
        enterprise_id: '11111111-1111-4111-8111-111111111111',
        collection_point_id: '22222222-2222-4222-8222-222222222222',
        catalog_item_id: '33333333-3333-4333-8333-333333333333',
        message: 'Ótimo produto',
        rating: '5',
        answers: JSON.stringify(defaultAnswers),
      }),
    );

    expect(response.status).toBe(200);
    expect(mockServiceSubmitQrcodeFeedback).toHaveBeenCalledWith({
      enterprise_id: '11111111-1111-4111-8111-111111111111',
      collection_point_id: '22222222-2222-4222-8222-222222222222',
      catalog_item_id: '33333333-3333-4333-8333-333333333333',
      message: 'Ótimo produto',
      rating: 5,
      answers: defaultAnswers,
      subanswers: [],
      channel: 'QRCODE',
      customer_name: undefined,
      customer_email: undefined,
      customer_gender: undefined,
    });
  });

  it('retorna alreadySubmitted quando serviço devolve conflito 409', async () => {
    const conflictError = new Error('duplicate') as Error & {
      status?: number;
      code?: string;
    };

    conflictError.status = 409;
    conflictError.code = 'DEVICE_ALREADY_SUBMITTED';

    mockServiceSubmitQrcodeFeedback.mockRejectedValue(conflictError);

    const response = await ActionPublicQrCodeFeedback(
      createArgs({
        enterprise_id: '11111111-1111-4111-8111-111111111111',
        collection_point_id: '22222222-2222-4222-8222-222222222222',
        message: 'Teste',
        rating: '5',
        answers: JSON.stringify(defaultAnswers),
      }),
    );

    expect(response.status).toBe(409);
    const payload = await response.json();
    expect(payload).toEqual({ alreadySubmitted: true });
  });

  it('bloqueia segundo envio no mesmo QR no mesmo dia (409)', async () => {
    let callCountForSameQr = 0;

    mockServiceSubmitQrcodeFeedback.mockImplementation(async (payload) => {
      if (payload.collection_point_id === '22222222-2222-4222-8222-222222222222') {
        callCountForSameQr += 1;
        if (callCountForSameQr > 1) {
          const conflictError = new Error('duplicate') as Error & {
            status?: number;
            code?: string;
          };

          conflictError.status = 409;
          conflictError.code = 'DEVICE_ALREADY_SUBMITTED';
          throw conflictError;
        }
      }

      return {
        ok: true,
        id: `feedback-${callCountForSameQr}`,
      };
    });

    const firstResponse = await ActionPublicQrCodeFeedback(
      createArgs({
        enterprise_id: '11111111-1111-4111-8111-111111111111',
        collection_point_id: '22222222-2222-4222-8222-222222222222',
        message: 'Primeiro envio',
        rating: '5',
        answers: JSON.stringify(defaultAnswers),
      }),
    );

    const secondResponse = await ActionPublicQrCodeFeedback(
      createArgs({
        enterprise_id: '11111111-1111-4111-8111-111111111111',
        collection_point_id: '22222222-2222-4222-8222-222222222222',
        message: 'Segundo envio mesmo QR',
        rating: '4',
        answers: JSON.stringify(defaultAnswers),
      }),
    );

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(409);
    expect(await secondResponse.json()).toEqual({ alreadySubmitted: true });
  });

  it('permite envio em QR diferente no mesmo dia', async () => {
    const seenByCollectionPoint = new Set<string>();

    mockServiceSubmitQrcodeFeedback.mockImplementation(async (payload) => {
      const key = payload.collection_point_id ?? 'none';

      if (seenByCollectionPoint.has(key)) {
        const conflictError = new Error('duplicate') as Error & {
          status?: number;
          code?: string;
        };

        conflictError.status = 409;
        conflictError.code = 'DEVICE_ALREADY_SUBMITTED';
        throw conflictError;
      }

      seenByCollectionPoint.add(key);

      return {
        ok: true,
        id: `feedback-${key}`,
      };
    });

    const firstQrResponse = await ActionPublicQrCodeFeedback(
      createArgs({
        enterprise_id: '11111111-1111-4111-8111-111111111111',
        collection_point_id: '22222222-2222-4222-8222-222222222222',
        message: 'Feedback QR 1',
        rating: '5',
        answers: JSON.stringify(defaultAnswers),
      }),
    );

    const secondQrResponse = await ActionPublicQrCodeFeedback(
      createArgs({
        enterprise_id: '11111111-1111-4111-8111-111111111111',
        collection_point_id: '44444444-4444-4444-8444-444444444444',
        message: 'Feedback QR 2',
        rating: '5',
        answers: JSON.stringify(defaultAnswers),
      }),
    );

    expect(firstQrResponse.status).toBe(200);
    expect(secondQrResponse.status).toBe(200);
  });
});
