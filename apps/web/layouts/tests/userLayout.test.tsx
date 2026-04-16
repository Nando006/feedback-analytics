import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  useLoaderData: vi.fn(),
  useFetcher: vi.fn(),
  useNavigation: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useLoaderData: mocks.useLoaderData,
    useFetcher: mocks.useFetcher,
    useNavigation: mocks.useNavigation,
    Outlet: () => <div data-testid="outlet-content">Outlet content</div>,
  };
});

vi.mock('components/user/layout/Header', () => ({
  default: () => <header data-testid="layout-header">Header</header>,
}));

vi.mock('components/user/layout/Sidebar', () => ({
  default: () => <aside data-testid="layout-sidebar">Sidebar</aside>,
}));

import LayoutUser from '../user';
import { useFetcher, useLoaderData, useNavigation } from 'react-router-dom';

describe('LayoutUser', () => {
  beforeEach(() => {
    vi.mocked(useLoaderData).mockReturnValue({
      enterprise: {
        full_name: 'Empresa Teste',
      },
      collecting: null,
    } as ReturnType<typeof useLoaderData>);

    vi.mocked(useFetcher).mockReturnValue({
      state: 'idle',
      submit: vi.fn(),
    } as unknown as ReturnType<typeof useFetcher>);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('exibe skeleton do dashboard durante navegação para /user/dashboard', () => {
    vi.mocked(useNavigation).mockReturnValue({
      state: 'loading',
      location: {
        pathname: '/user/dashboard',
      },
    } as ReturnType<typeof useNavigation>);

    render(<LayoutUser />);

    expect(screen.getByLabelText('Dashboard skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet-content')).not.toBeInTheDocument();
  });

  it('renderiza conteúdo da rota quando não está carregando dashboard', () => {
    vi.mocked(useNavigation).mockReturnValue({
      state: 'idle',
      location: undefined,
      formMethod: undefined,
      formAction: undefined,
      formEncType: undefined,
      formData: undefined,
      json: undefined,
      text: undefined,
    } as ReturnType<typeof useNavigation>);

    render(<LayoutUser />);

    expect(screen.queryByLabelText('Dashboard skeleton')).not.toBeInTheDocument();
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });

  it.each([
    ['/user/profile', 'Profile skeleton'],
    ['/user/qrcode/enterprise', 'QrCode Enterprise skeleton'],
    ['/user/qrcode/products', 'QrCode Products skeleton'],
    ['/user/qrcode/services', 'QrCode Services skeleton'],
    ['/user/qrcode/departments', 'QrCode Departments skeleton'],
    ['/user/feedbacks/all', 'Feedbacks All skeleton'],
    ['/user/feedbacks/123', 'Feedback Details skeleton'],
    ['/user/feedbacks/analytics/all', 'Feedbacks Analytics All skeleton'],
    ['/user/feedbacks/analytics/positive', 'Feedbacks Analytics Positive skeleton'],
    ['/user/feedbacks/analytics/negative', 'Feedbacks Analytics Negative skeleton'],
    ['/user/insights/reports', 'Insights Report skeleton'],
    ['/user/insights/emotional', 'Insights Emotional skeleton'],
    ['/user/insights/statistics', 'Insights Statistics skeleton'],
    ['/user/edit/customers', 'Edit Customers skeleton'],
    ['/user/edit/profile', 'Edit Profile skeleton'],
    ['/user/edit/collecting-data-enterprise', 'Edit Collecting Data skeleton'],
    ['/user/edit/feedback-settings', 'Edit Feedback Settings skeleton'],
  ])('exibe skeleton esperado durante navegação para %s', (pathname, skeletonLabel) => {
    vi.mocked(useNavigation).mockReturnValue({
      state: 'loading',
      location: {
        pathname,
      },
    } as ReturnType<typeof useNavigation>);

    render(<LayoutUser />);

    expect(screen.getByLabelText(skeletonLabel)).toBeInTheDocument();
    expect(screen.queryByTestId('outlet-content')).not.toBeInTheDocument();
  });
});
