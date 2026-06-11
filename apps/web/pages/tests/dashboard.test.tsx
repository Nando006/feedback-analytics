import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  useLoaderData: vi.fn(),
  useRouteLoaderData: vi.fn(),
  getFeedbackStats: vi.fn(),
  useInsightsControls: vi.fn(),
  useScopedInsightsReport: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useLoaderData: mocks.useLoaderData,
    useRouteLoaderData: mocks.useRouteLoaderData,
  };
});

vi.mock('src/services/serviceFeedbacks', () => ({
  ServiceGetFeedbackStats: mocks.getFeedbackStats,
}));

vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: mocks.useInsightsControls,
}));

vi.mock('src/lib/hooks/useScopedInsightsReport', () => ({
  useScopedInsightsReport: mocks.useScopedInsightsReport,
}));

import { useLoaderData, useRouteLoaderData } from 'react-router-dom';
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

const dashboardLoaderData = {
  stats: feedbackStats,
  dashboardError: null,
};

describe('[Unidade] Dashboard Page', () => {
  beforeEach(() => {
    vi.mocked(useLoaderData).mockReturnValue(
      dashboardLoaderData as ReturnType<typeof useLoaderData>,
    );
    vi.mocked(useRouteLoaderData).mockReturnValue(
      loaderData as ReturnType<typeof useRouteLoaderData>,
    );
    mocks.getFeedbackStats.mockResolvedValue(feedbackStats);
    mocks.useInsightsControls.mockReturnValue({
      scope: 'COMPANY',
      catalogItemId: '',
    });
    mocks.useScopedInsightsReport.mockReturnValue({
      report: null,
      summary: null,
      loading: false,
      error: null,
      reload: vi.fn(),
    });
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
      screen.getByText('Acompanhe as métricas e os insights dos seus feedbacks no escopo selecionado.'),
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

  it('exibe o bloco de relatório de insights (estado vazio sem relatório)', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText('Relatório de Insights')).toBeInTheDocument();
    expect(
      screen.getByText('Ainda não há relatório para este escopo'),
    ).toBeInTheDocument();
  });
});
