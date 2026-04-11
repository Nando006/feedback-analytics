import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock de react-router-dom para evitar erros de export no ambiente de testes do CI
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    MemoryRouter:
      actual.MemoryRouter ??
      (({ children }: { children: React.ReactNode }) => <>{children}</>),
    Link:
      actual.Link ??
      (({ to, children }: { to: string; children: React.ReactNode }) => (
        <a href={to}>{children}</a>
      )),
  };
});

import { MemoryRouter } from 'react-router-dom';
import Home from '../public/home';

describe('Home Page', () => {
  it('deve renderizar o conteúdo da página home', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(
      screen.getByText('Entenda seus clientes com análises inteligentes e rápidas.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Feedback Analytics · IA')).toBeInTheDocument();
    expect(screen.getByText('Começar agora')).toBeInTheDocument();
    expect(screen.getByText('Ver como funciona')).toBeInTheDocument();
  });

  it('deve ter a estrutura HTML correta', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv.tagName).toBe('DIV');
  });
});
