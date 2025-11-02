import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  useRouteLoaderData: vi.fn(),
  ServiceGetFeedbacks: vi.fn(),
  ServiceGetFeedbackStats: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useRouteLoaderData: mocks.useRouteLoaderData,
  };
});

vi.mock('src/services/feedbacks', () => ({
  ServiceGetFeedbacks: mocks.ServiceGetFeedbacks,
  ServiceGetFeedbackStats: mocks.ServiceGetFeedbackStats,
}));

import { useRouteLoaderData } from 'react-router-dom';
import Dashboard from '../user/dashboard';

const loaderData = {
  user: {
    id: 'user-1',
    email: 'user@example.com',
    phone: '+5511999999999',
    user_metadata: { full_name: 'Usuário Teste' },
  },
  enterprise: {
    id: 'enterprise-1',
    document: '12345678900',
    created_at: new Date().toISOString(),
    account_type: 'CPF',
    email: 'enterprise@example.com',
    phone: '+5511988887777',
    full_name: 'Empresa XPTO',
  },
  collecting: {
    id: 'collecting-1',
    enterprise_id: 'enterprise-1',
    company_objective: 'Expandir operações',
    analytics_goal: 'Entender NPS',
    business_summary: 'Empresa de tecnologia focada em feedbacks',
    main_products_or_services: ['Produto A', 'Serviço B'],
    uses_company_products: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const feedbackStats = {
  totalFeedbacks: 12,
  averageRating: 4.2,
  ratingDistribution: {
    1: 1,
    2: 1,
    3: 2,
    4: 3,
    5: 5,
  },
  sentimentBreakdown: {
    positive: 8,
    neutral: 2,
    negative: 2,
  },
};

const feedbacksResponse = {
  feedbacks: [
    {
      id: 'fb-1',
      message: 'Excelente atendimento e produto!',
      rating: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      collection_points: {
        id: 'cp-1',
        name: 'QR Code principal',
        type: 'QR_CODE',
        identifier: 'main-qrcode',
      },
      tracked_devices: {
        id: 'td-1',
        device_fingerprint: 'fingerprint',
        user_agent: 'Mozilla',
        ip_address: '127.0.0.1',
        feedback_count: 3,
        is_blocked: false,
        customer_id: 'customer-1',
        customer: {
          id: 'customer-1',
          name: 'Cliente XPTO',
          email: 'cliente@example.com',
          gender: 'Masculino',
        },
      },
    },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    itemsPerPage: 5,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.mocked(useRouteLoaderData).mockReturnValue(
      loaderData as ReturnType<typeof useRouteLoaderData>,
    );
    mocks.ServiceGetFeedbackStats.mockResolvedValue(feedbackStats);
    mocks.ServiceGetFeedbacks.mockResolvedValue(feedbacksResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('renderiza título e saudação com dados do loader', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Acompanhe o desempenho dos seus feedbacks, veja tendências e monitore como os clientes estão interagindo com a sua empresa.'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Olá, Usuário Teste')).toBeInTheDocument();
    });
  });

  it('exibe métricas principais após carregar estatísticas', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Feedbacks recebidos')).toBeInTheDocument();
    });

    const totalCard = screen.getByText('Feedbacks recebidos').closest('div');
    const averageCard = screen.getByText('Média de satisfação').closest('div');
    const positiveCard = screen.getByText('Feedbacks positivos').closest('div');
    const criticalCard = screen.getByText('Feedbacks críticos').closest('div');

    expect(totalCard).not.toBeNull();
    expect(averageCard).not.toBeNull();
    expect(positiveCard).not.toBeNull();
    expect(criticalCard).not.toBeNull();

    expect(within(totalCard!).getByText('12')).toBeInTheDocument();
    expect(within(averageCard!).getByText('4,2')).toBeInTheDocument();
    expect(within(positiveCard!).getByText('8')).toBeInTheDocument();
    expect(within(criticalCard!).getByText('2')).toBeInTheDocument();
  });

  it('lista o feedback mais recente ao finalizar o carregamento', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Excelente atendimento e produto!')).toBeInTheDocument();
    });

    expect(
      screen.getByText((_, node) => node?.textContent === 'Cliente: Cliente XPTO'),
    ).toBeInTheDocument();
    expect(mocks.ServiceGetFeedbacks).toHaveBeenCalledWith({ limit: 5, page: 1 });
    expect(mocks.ServiceGetFeedbackStats).toHaveBeenCalledTimes(1);
  });
});
