import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useNavigation, useRouteLoaderData } from 'react-router-dom';
import Profile from '../user/profile';

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigation: vi.fn(),
    useRouteLoaderData: vi.fn(),
  };
});

// Mock dos componentes filhos
vi.mock('components/user/pages/profile/editUser/information', () => ({
  default: ({
    defaultFullName,
    defaultEmail,
    defaultPhone,
  }: {
    defaultFullName?: string;
    defaultEmail?: string;
    defaultPhone?: string;
  }) => (
    <div data-testid="profile-info">
      <div data-testid="enterprise-name">{defaultFullName}</div>
      <div data-testid="profile-email">{defaultEmail}</div>
      <div data-testid="profile-phone">{defaultPhone}</div>
    </div>
  ),
}));

vi.mock('components/user/shared/header', () => ({
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

vi.mock('components/user/pages/profile/editCollectingData/formCollectingDataEnterprise', () => ({
  default: () => <div data-testid="form-collecting-data-enterprise">FormCollectingDataEnterprise</div>,
}));

vi.mock('components/user/pages/profile/questionsDinamic/questionDinamicEnterprise', () => ({
  default: () => <div data-testid="question-dinamic-enterprise">QuestionDinamicEnterprise</div>,
}));

// Mock do useRouteLoaderData e useNavigation
const mockUseRouteLoaderData = vi.mocked(useRouteLoaderData);
const mockUseNavigation = vi.mocked(useNavigation);

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
      user_metadata: {
        full_name: 'João Silva',
      },
    },
    collecting: {
      id: '1',
      uses_company_products: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigation.mockReturnValue({
      state: 'idle',
      location: undefined,
      formMethod: undefined,
      formAction: undefined,
      formEncType: undefined,
      formData: undefined,
      json: undefined,
      text: undefined,
    } as unknown as ReturnType<typeof useNavigation>);
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
      'João Silva',
    );
    expect(screen.getByTestId('profile-email')).toHaveTextContent(
      'joao@teste.com',
    );
  });

  it('deve lidar com dados de collecting nulos', () => {
    const dataWithoutCollecting = {
      ...mockData,
      collecting: null,
    };

    mockUseRouteLoaderData.mockReturnValue(dataWithoutCollecting);

    render(<Profile />);

    expect(screen.getByTestId('enterprise-name')).toHaveTextContent(
      'João Silva',
    );
  });

  it('deve ter a estrutura HTML correta', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    const { container } = render(<Profile />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('font-work-sans', 'space-y-6');
  });

  it('deve chamar useRouteLoaderData com a chave correta', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(<Profile />);

    expect(mockUseRouteLoaderData).toHaveBeenCalledWith('user');
  });

  it('deve lidar com dados incompletos', () => {
    const incompleteData = {
      enterprise: { name: 'Empresa Parcial', full_name: 'Empresa Parcial' },
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
