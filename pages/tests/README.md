# Testes de Páginas

Este diretório contém os testes para as páginas do projeto usando Vitest e React Testing Library.

## Estrutura dos Testes

### Páginas Testadas

- **home.test.tsx** - Testes da página Home (pública)
- **login.test.tsx** - Testes da página Login (pública)
- **register.test.tsx** - Testes da página Register (pública)
- **profile.test.tsx** - Testes da página Profile (usuário autenticado)
- **dashboard.test.tsx** - Testes da página Dashboard (usuário autenticado)

### Padrões de Teste

#### 1. Páginas Simples (Home, Dashboard)

```typescript
// Teste básico de renderização
it('deve renderizar o conteúdo da página', () => {
  render(<Home />);
  expect(screen.getByText('Home Page')).toBeInTheDocument();
});
```

#### 2. Páginas com Componentes (Login, Register)

```typescript
// Mock de componentes filhos para focar no teste da página
vi.mock('components/public/shared/cards/card', () => ({
  default: ({ title, text }: any) => (
    <div data-testid="card-form">
      <div data-testid="card-title">{title}</div>
    </div>
  ),
}));
```

#### 3. Páginas com Dados do Router (Profile)

```typescript
// Mock do useRouteLoaderData
const mockUseRouteLoaderData = vi.mocked(useRouteLoaderData);

beforeEach(() => {
  mockUseRouteLoaderData.mockReturnValue(mockData);
});
```

## Executando os Testes

### Todos os testes de páginas

```bash
npm test pages/tests
```

### Teste específico

```bash
npm test pages/tests/login.test.tsx
```

### Modo watch (desenvolvimento)

```bash
npm test pages/tests -- --watch
```

## Configuração

### Setup Global

O arquivo `lib/utils/tests/setup.ts` contém:

- Importação do `@testing-library/jest-dom`
- Mocks globais para `react-router-dom`
- Mock do `window.matchMedia` (Tailwind)

### Dependências de Teste

- `@testing-library/react` - Renderização e queries
- `@testing-library/jest-dom` - Matchers customizados
- `@testing-library/user-event` - Simulação de eventos
- `vitest` - Test runner
- `jsdom` - Ambiente DOM simulado

## Boas Práticas

### 1. Isolamento de Componentes

- Use mocks para componentes filhos complexos
- Foque no comportamento da página, não dos componentes internos

### 2. Data-testid

- Use `data-testid` para elementos que precisam ser testados
- Evite depender de classes CSS ou texto que pode mudar

### 3. Testes de Comportamento

- Teste o que o usuário vê e faz
- Não teste detalhes de implementação

### 4. Mocks Apropriados

- Mock apenas o necessário
- Use `vi.clearAllMocks()` no `beforeEach` quando necessário

## Exemplos de Testes

### Renderização Básica

```typescript
it('deve renderizar a página', () => {
  render(<MyPage />);
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

### Interação com Dados

```typescript
it('deve exibir dados do usuário', () => {
  mockUseRouteLoaderData.mockReturnValue({ user: { name: 'João' } });
  render(<Profile />);
  expect(screen.getByText('João')).toBeInTheDocument();
});
```

### Classes CSS

```typescript
it('deve ter as classes corretas', () => {
  const { container } = render(<Login />);
  expect(container.firstChild).toHaveClass('min-h-screen');
});
```
