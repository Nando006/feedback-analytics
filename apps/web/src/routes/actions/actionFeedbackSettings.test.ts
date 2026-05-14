import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionFunctionArgs } from 'react-router-dom';
import { ActionFeedbackSettings } from './actionFeedbackSettings';
import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';

vi.mock('src/services/serviceEnterprise', () => ({
  ServiceUpdateCollectingDataEnterprise: vi.fn(),
}));

const mockUpdateCollectingDataEnterprise = vi.mocked(ServiceUpdateCollectingDataEnterprise);

const baseCollecting = {
  id: 'collecting-id',
  enterprise_id: 'enterprise-id',
  company_objective: null,
  analytics_goal: null,
  business_summary: null,
  main_products_or_services: null,
  uses_company_products: false,
  uses_company_services: false,
  uses_company_departments: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function createRequest(body: Record<string, string | undefined>) {
  const formData = new URLSearchParams();

  Object.entries(body).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      formData.append(key, value);
    }
  });

  return new Request('http://localhost/user/edit/feedback-settings', {
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
  } as unknown as ActionFunctionArgs;
}

describe('ActionFeedbackSettings', () => {
  beforeEach(() => {
    mockUpdateCollectingDataEnterprise.mockReset();
  });

  it('retorna erro quando intent é inválida', async () => {
    const response = await ActionFeedbackSettings(
      createArgs({
        intent: 'invalid_intent',
      }),
    );

    expect(response).toEqual({ error: 'Ação inválida.' });
    expect(mockUpdateCollectingDataEnterprise).not.toHaveBeenCalled();
  });

  it('salva perguntas da empresa com subperguntas válidas', async () => {
    mockUpdateCollectingDataEnterprise.mockResolvedValue({
      ...baseCollecting,
    });

    const companyQuestions = [
      {
        question_order: 1,
        question_text: 'Como você avalia o tempo de atendimento na recepção?',
        is_active: true,
        subquestions: [
          {
            subquestion_order: 1,
            subquestion_text: 'A fila do atendimento estava organizada e sinalizada?',
            is_active: true,
          },
        ],
      },
      {
        question_order: 2,
        question_text: 'Como você avalia a clareza das informações recebidas?',
        is_active: true,
        subquestions: [
          {
            subquestion_order: 1,
            subquestion_text: 'As instruções sobre próximos passos ficaram claras para você?',
            is_active: true,
          },
        ],
      },
      {
        question_order: 3,
        question_text: 'Como foi sua percepção geral sobre o atendimento recebido?',
        is_active: true,
        subquestions: [
          {
            subquestion_order: 1,
            subquestion_text: 'Você se sentiu acolhido e bem orientado durante a experiência?',
            is_active: true,
          },
        ],
      },
    ];

    const response = await ActionFeedbackSettings(
      createArgs({
        intent: 'save_company_feedback_questions',
        company_feedback_questions: JSON.stringify(companyQuestions),
      }),
    );

    expect(response).toEqual({
      ok: true,
      scope: 'COMPANY',
      message: 'Perguntas da empresa atualizadas com sucesso.',
      collecting: expect.any(Object),
    });
    expect(mockUpdateCollectingDataEnterprise).toHaveBeenCalledWith({
      company_feedback_questions: companyQuestions,
    });
  });

  it('bloqueia salvamento quando perguntas da empresa são inválidas', async () => {
    const response = await ActionFeedbackSettings(
      createArgs({
        intent: 'save_company_feedback_questions',
        company_feedback_questions: JSON.stringify([
          {
            question_order: 1,
            question_text: 'curta',
            is_active: true,
            subquestions: [],
          },
          {
            question_order: 2,
            question_text: 'Como você avalia o atendimento da equipe durante a visita?',
            is_active: true,
            subquestions: [],
          },
          {
            question_order: 3,
            question_text: 'Como foi sua percepção geral sobre a experiência no local?',
            is_active: true,
            subquestions: [],
          },
        ]),
      }),
    );

    expect(response).toEqual({ error: 'Perguntas da empresa inválidas. Verifique o preenchimento.' });
    expect(mockUpdateCollectingDataEnterprise).not.toHaveBeenCalled();
  });

  it('salva catálogo de produtos com mapeamento para legado', async () => {
    mockUpdateCollectingDataEnterprise.mockResolvedValue({
      ...baseCollecting,
      uses_company_products: true,
      main_products_or_services: ['Produto A', 'Produto B'],
    });

    const response = await ActionFeedbackSettings(
      createArgs({
        intent: 'save_products_catalog',
        catalog_items: JSON.stringify([
          {
            name: 'Produto A',
            description: 'Descrição A',
            sort_order: 0,
          },
          {
            name: 'Produto B',
            description: '',
            sort_order: 1,
          },
        ]),
      }),
    );

    expect(response).toEqual({
      ok: true,
      scope: 'PRODUCT',
      message: 'Catálogo de produtos atualizado com sucesso.',
      collecting: expect.any(Object),
    });
    expect(mockUpdateCollectingDataEnterprise).toHaveBeenCalledWith({
      uses_company_products: true,
      catalog_products: [
        {
          name: 'Produto A',
          description: 'Descrição A',
          sort_order: 0,
          status: 'ACTIVE',
        },
        {
          name: 'Produto B',
          description: null,
          sort_order: 1,
          status: 'ACTIVE',
        },
      ],
      main_products_or_services: ['Produto A', 'Produto B'],
    });
  });

  it('retorna erro quando catálogo vem em formato inválido', async () => {
    const response = await ActionFeedbackSettings(
      createArgs({
        intent: 'save_services_catalog',
        catalog_items: '{"invalid":true}',
      }),
    );

    expect(response).toEqual({
      error: 'Itens de catálogo inválidos.',
    });
    expect(mockUpdateCollectingDataEnterprise).not.toHaveBeenCalled();
  });
});
