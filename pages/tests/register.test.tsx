import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Register from '../public/register';

// Mock dos componentes filhos
vi.mock('components/svg/lock', () => ({
  default: () => <div data-testid="svg-lock">Lock Icon</div>,
}));

vi.mock('components/public/shared/card', () => ({
  default: ({
    title,
    text,
    children,
    linkLogin,
    icon,
  }: {
    title: string;
    text: string;
    children: React.ReactNode;
    linkLogin?: string;
    icon: React.ReactNode;
  }) => (
    <div data-testid="card-form">
      <div data-testid="card-title">{title}</div>
      <div data-testid="card-text">{text}</div>
      <div data-testid="card-icon">{icon}</div>
      <div data-testid="card-form-content">{children}</div>
      {linkLogin && (
        <a
          href={linkLogin}
          data-testid="login-link">
          Login Link
        </a>
      )}
    </div>
  ),
}));

vi.mock('components/public/forms/formRegister', () => ({
  default: () => <div data-testid="form-register">Register Form</div>,
}));

describe('Register Page', () => {
  it('deve renderizar todos os elementos principais da página', () => {
    render(<Register />);

    expect(screen.getByTestId('card-form')).toBeInTheDocument();
    expect(screen.getByTestId('card-title')).toHaveTextContent(
      'Crie sua conta',
    );
    expect(screen.getByTestId('card-text')).toHaveTextContent(
      'Leve, moderno e intuitivo - comece em minutos',
    );
  });

  it('deve renderizar o formulário de registro', () => {
    render(<Register />);

    expect(screen.getByTestId('form-register')).toBeInTheDocument();
    expect(screen.getByTestId('form-register')).toHaveTextContent(
      'Register Form',
    );
  });

  it('deve renderizar o ícone de cadeado', () => {
    render(<Register />);

    expect(screen.getByTestId('svg-lock')).toBeInTheDocument();
  });

  it('deve ter link para página de login', () => {
    render(<Register />);

    const loginLink = screen.getByTestId('login-link');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('deve ter as classes CSS corretas para o layout', () => {
    const { container } = render(<Register />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'min-h-screen',
      'bg-(--bg-primary)',
    );
  });

  it('deve renderizar elementos decorativos de fundo', () => {
    const { container } = render(<Register />);

    const decorativeElements = container.querySelectorAll('.absolute');
    expect(decorativeElements.length).toBeGreaterThan(0);
  });

  it('deve ter container com largura máxima correta', () => {
    render(<Register />);

    const container = screen.getByTestId('card-form').parentElement;
    expect(container).toHaveClass('max-w-2xl');
  });

  it('deve ter posicionamento relativo no container principal', () => {
    const { container } = render(<Register />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('relative');
  });
});
