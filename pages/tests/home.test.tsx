import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../public/home';

// Simulando o react-router-dom para renderização de links
vi.mock('react-router-dom', async () => {
  const actual = await import('react-router-dom');
  return {
    ...actual,
  };
});

describe('Home Page', () => {
  it('deve renderizar o conteúdo da página home', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  });

  it('deve ter a estrutura HTML correta', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv.tagName).toBe('DIV');
  });
});
