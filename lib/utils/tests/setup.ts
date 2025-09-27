import '@testing-library/jest-dom';

// Mock do react-router-dom
import { vi } from 'vitest';

// Mock para useRouteLoaderData
vi.mock('react-router-dom', () => ({
  useRouteLoaderData: vi.fn(),
}));

// Mock para window.matchMedia (usado pelo Tailwind)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
