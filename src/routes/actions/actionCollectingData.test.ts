import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ActionCollectingData } from './actionCollectingData';
import { ServiceUpdateCollectingDataEnterprise } from 'src/services/serviceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';

vi.mock('src/services/serviceEnterprise', () => ({
  ServiceUpdateCollectingDataEnterprise: vi.fn(),
}));

const mockUpdateCollectingDataEnterprise = vi.mocked(ServiceUpdateCollectingDataEnterprise);

function createRequest(body: Record<string, string | undefined>) {
  const formData = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      formData.append(key, value);
    }
  });

  return new Request('http://localhost/user/edit/collecting-data-enterprise', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });
}

function createArgs(body: Record<string, string | undefined>): ActionFunctionArgs {
  const request = createRequest(body);

  return {
    request,
    params: {},
    context: undefined
  }
}

describe('ActionCollectingData', () => {
  beforeEach(() => {
    mockUpdateCollectingDataEnterprise.mockReset();
  });

  it('envia produtos quando uses_company_products está marcado', async () => {
    mockUpdateCollectingDataEnterprise.mockResolvedValue({
      id: 'collecting-id',
      enterprise_id: 'enterprise-id',
      company_objective: null,
      analytics_goal: null,
      business_summary: null,
      main_products_or_services: ['Produto 1', 'Produto 2'],
      uses_company_products: true,
      uses_company_services: true,
      uses_company_departments: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await ActionCollectingData(
      createArgs({
        company_objective: 'Objetivo',
        analytics_goal: 'Meta',
        business_summary: 'Resumo',
        main_products_or_services: 'Produto 1\nProduto 2\n',
        uses_company_products: 'on',
        uses_company_services: 'on',
        uses_company_departments: 'false',
      }),
    );

    expect(mockUpdateCollectingDataEnterprise).toHaveBeenCalledWith({
      company_objective: 'Objetivo',
      analytics_goal: 'Meta',
      business_summary: 'Resumo',
      main_products_or_services: ['Produto 1', 'Produto 2'],
      uses_company_products: true,
      uses_company_services: true,
      uses_company_departments: false,
      catalog_products: [
        {
          name: 'Produto 1',
          description: null,
          sort_order: 0,
          status: 'ACTIVE',
        },
        {
          name: 'Produto 2',
          description: null,
          sort_order: 1,
          status: 'ACTIVE',
        },
      ],
      catalog_services: [],
      catalog_departments: [],
    });
  });

  it('remove produtos quando uses_company_products está desmarcado', async () => {
    mockUpdateCollectingDataEnterprise.mockResolvedValue({
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
    });

    await ActionCollectingData(
      createArgs({
        main_products_or_services: 'Produto 1',
        uses_company_products: 'false',
        uses_company_services: 'false',
        uses_company_departments: 'false',
      }),
    );

    expect(mockUpdateCollectingDataEnterprise).toHaveBeenCalledWith({
      company_objective: null,
      analytics_goal: null,
      business_summary: null,
      main_products_or_services: null,
      uses_company_products: false,
      uses_company_services: false,
      uses_company_departments: false,
      catalog_products: [],
      catalog_services: [],
      catalog_departments: [],
    });
  });

  it('prioriza catálogo estruturado quando catalog_products é informado', async () => {
    mockUpdateCollectingDataEnterprise.mockResolvedValue({
      id: 'collecting-id',
      enterprise_id: 'enterprise-id',
      company_objective: null,
      analytics_goal: null,
      business_summary: null,
      main_products_or_services: ['Produto JSON'],
      uses_company_products: true,
      uses_company_services: false,
      uses_company_departments: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await ActionCollectingData(
      createArgs({
        uses_company_products: 'true',
        uses_company_services: 'false',
        uses_company_departments: 'false',
        main_products_or_services: 'Produto legado',
        catalog_products: JSON.stringify([
          {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Produto JSON',
            description: 'Descrição',
            sort_order: 3,
          },
        ]),
      }),
    );

    expect(mockUpdateCollectingDataEnterprise).toHaveBeenCalledWith({
      company_objective: null,
      analytics_goal: null,
      business_summary: null,
      main_products_or_services: ['Produto JSON'],
      uses_company_products: true,
      uses_company_services: false,
      uses_company_departments: false,
      catalog_products: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Produto JSON',
          description: 'Descrição',
          sort_order: 3,
          status: 'ACTIVE',
        },
      ],
      catalog_services: [],
      catalog_departments: [],
    });
  });
});
