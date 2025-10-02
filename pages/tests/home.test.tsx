import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../public/home';

// Simulando o react-router-dom para renderização de links
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

describe('Home Page', () => {
  it('deve renderizar o conteúdo da página home', () => {
    render(<Home />);

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('deve ter a estrutura HTML correta', () => {
    const { container } = render(<Home />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv.tagName).toBe('DIV');
  });
});
