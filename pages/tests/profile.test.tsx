import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouteLoaderData } from 'react-router-dom';
import Profile from '../user/profile';

// Mock dos componentes filhos
vi.mock('components/user/profile/info', () => ({
  default: ({
    enterprise,
    collecting,
  }: {
    enterprise?: { name?: string };
    collecting?: { id?: string } | null;
  }) => (
    <div data-testid="profile-info">
      <div data-testid="enterprise-name">{enterprise?.name}</div>
      <div data-testid="collecting-data">
        {collecting ? 'Has collecting data' : 'No collecting data'}
      </div>
    </div>
  ),
}));

vi.mock('components/user/profile/header', () => ({
  default: ({
    enterprise,
    user,
  }: {
    enterprise?: { name?: string };
    user?: { name?: string };
  }) => (
    <div data-testid="profile-header">
      <div data-testid="user-name">{user?.name}</div>
      <div data-testid="enterprise-header">{enterprise?.name}</div>
    </div>
  ),
}));

// Mock do useRouteLoaderData
const mockUseRouteLoaderData = vi.mocked(useRouteLoaderData);

describe('Profile Page', () => {
  const mockData = {
    enterprise: {
      id: '1',
      name: 'Empresa Teste',
      email: 'empresa@teste.com',
    },
    user: {
      id: '1',
      name: 'João Silva',
      email: 'joao@teste.com',
    },
    collecting: {
      id: '1',
      uses_company_products: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar os componentes principais com dados válidos', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(<Profile />);

    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info')).toBeInTheDocument();
  });

  it('deve passar os dados corretos para o componente Header', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(<Profile />);

    expect(screen.getByTestId('user-name')).toHaveTextContent('João Silva');
    expect(screen.getByTestId('enterprise-header')).toHaveTextContent(
      'Empresa Teste',
    );
  });

  it('deve passar os dados corretos para o componente Info', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(<Profile />);

    expect(screen.getByTestId('enterprise-name')).toHaveTextContent(
      'Empresa Teste',
    );
    expect(screen.getByTestId('collecting-data')).toHaveTextContent(
      'Has collecting data',
    );
  });

  it('deve lidar com dados de collecting nulos', () => {
    const dataWithoutCollecting = {
      ...mockData,
      collecting: null,
    };

    mockUseRouteLoaderData.mockReturnValue(dataWithoutCollecting);

    render(<Profile />);

    expect(screen.getByTestId('collecting-data')).toHaveTextContent(
      'No collecting data',
    );
  });

  it('deve ter a estrutura HTML correta', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    const { container } = render(<Profile />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('font-inter', 'space-y-6');
  });

  it('deve chamar useRouteLoaderData com a chave correta', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(<Profile />);

    expect(mockUseRouteLoaderData).toHaveBeenCalledWith('user');
  });

  it('deve lidar com dados incompletos', () => {
    const incompleteData = {
      enterprise: { name: 'Empresa Parcial' },
      user: { name: 'Usuário Parcial' },
      collecting: null,
    };

    mockUseRouteLoaderData.mockReturnValue(incompleteData);

    render(<Profile />);

    expect(screen.getByTestId('profile-header')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info')).toBeInTheDocument();
    expect(screen.getByTestId('user-name')).toHaveTextContent(
      'Usuário Parcial',
    );
    expect(screen.getByTestId('enterprise-name')).toHaveTextContent(
      'Empresa Parcial',
    );
  });
});
