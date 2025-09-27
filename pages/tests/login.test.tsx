import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from '../public/login';

// Mock dos componentes filhos para focar no teste da página
vi.mock('components/public/shared/cards/cardForm', () => ({
  default: ({ title, text, linkRegister, icon, form }: any) => (
    <div data-testid="card-form">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-text">{text}</div>
      <div data-testid="card-icon">{icon}</div>
      <div data-testid="card-form-content">{form}</div>
      <a
        href={linkRegister}
        data-testid="register-link">
        Register Link
      </a>
    </div>
  ),
}));

vi.mock('components/public/forms/formLogin', () => ({
  default: () => <div data-testid="form-login">Login Form</div>,
}));

vi.mock('components/svg/lock', () => ({
  default: () => <div data-testid="svg-lock">Lock Icon</div>,
}));

describe('Login Page', () => {
  it('deve renderizar todos os elementos principais da página', () => {
    render(<Login />);

    expect(screen.getByTestId('card-form')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toHaveTextContent(
      'Bem-vindo de volta',
    );
    expect(screen.getByTestId('card-text')).toHaveTextContent(
      'Entre na sua conta para continuar',
    );
  });

  it('deve renderizar o formulário de login', () => {
    render(<Login />);

    expect(screen.getByTestId('form-login')).toBeInTheDocument();
    expect(screen.getByTestId('form-login')).toHaveTextContent('Login Form');
  });

  it('deve renderizar o ícone de cadeado', () => {
    render(<Login />);

    expect(screen.getByTestId('svg-lock')).toBeInTheDocument();
  });

  it('deve ter link para página de registro', () => {
    render(<Login />);

    const registerLink = screen.getByTestId('register-link');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('deve renderizar os links de termos e política', () => {
    render(<Login />);

    expect(screen.getByText('Termos de Serviço')).toBeInTheDocument();
    expect(screen.getByText('Política de Privacidade')).toBeInTheDocument();
  });

  it('deve ter as classes CSS corretas para o layout', () => {
    const { container } = render(<Login />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'min-h-screen',
      'bg-gradient-to-b',
      'from-neutral-900',
      'to-neutral-800',
    );
  });

  it('deve renderizar elementos decorativos de fundo', () => {
    const { container } = render(<Login />);

    const decorativeElements = container.querySelectorAll('.absolute');
    expect(decorativeElements.length).toBeGreaterThan(0);
  });
});
