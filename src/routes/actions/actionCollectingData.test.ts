import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ActionCollectingData } from './actionCollectingData';
import { ServiceUpdateCollectingDataEnterprise } from 'src/services/ServiceEnterprise';
import type { ActionFunctionArgs } from 'react-router-dom';

vi.mock('src/services/serviceEnterprise', () => ({
  ServiceUpdateCollectingDataEnterprise: vi.fn(),
}));

const mockUpdateCollectingDataEnterprise = vi.mocked(ServiceUpdateCollectingDataEnterprise);

function createRequest(body: Record<string, string | undefined>) {
  const formData = new FormData();
  Object.entries(body).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      formData.append(key, value);
    }
  });

  return new Request('http://localhost/user/edit/collecting-data-enterprise', {
    method: 'POST',
    body: formData,
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
      }),
    );

    expect(mockUpdateCollectingDataEnterprise).toHaveBeenCalledWith({
      company_objective: 'Objetivo',
      analytics_goal: 'Meta',
      business_summary: 'Resumo',
      main_products_or_services: ['Produto 1', 'Produto 2'],
      uses_company_products: true,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await ActionCollectingData(
      createArgs({
        main_products_or_services: 'Produto 1',
        uses_company_products: 'false',
      }),
    );

    expect(mockUpdateCollectingDataEnterprise).toHaveBeenCalledWith({
      company_objective: null,
      analytics_goal: null,
      business_summary: null,
      main_products_or_services: null,
      uses_company_products: false,
    });
  });
});
