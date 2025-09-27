import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Dashboard from '../user/dashboard';

describe('Dashboard Page', () => {
  it('deve renderizar o texto da dashboard', () => {
    render(<Dashboard />);

    expect(screen.getByText('Testando sidebar')).toBeInTheDocument();
  });

  it('deve renderizar um fragmento React', () => {
    const { container } = render(<Dashboard />);

    // Como é um React Fragment, o container deve ter o texto diretamente
    expect(container.textContent).toBe('Testando sidebar');
  });

  it('deve ter apenas um nó de texto', () => {
    const { container } = render(<Dashboard />);

    expect(container.childNodes).toHaveLength(1);
  });
});
