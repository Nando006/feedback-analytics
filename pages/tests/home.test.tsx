import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../public/home';

describe('Home Page', () => {
  it('deve renderizar o conteúdo da página home', () => {
    render(<Home />);

    expect(screen.getByText('Homes Page')).toBeInTheDocument();
  });

  it('deve ter a estrutura HTML correta', () => {
    const { container } = render(<Home />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv.tagName).toBe('DIV');
  });
});
