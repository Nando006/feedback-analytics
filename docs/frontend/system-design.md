# Frontend — System Design

Este documento registra as decisões estruturais do frontend: como os componentes são organizados, qual kit visual guia a interface, onde as falhas são contidas e como a base foi projetada para ser reutilizável.

---

## Componentes Globais vs. Locais

A hierarquia de componentes segue uma regra de escopo: quanto mais próximo de uma tela específica, menos reaproveitável deve ser.

| Nível | Pasta | O que vai aqui |
|---|---|---|
| **Global (app inteiro)** | `components/globals/` | Componentes que afetam qualquer rota (ex: `errorPage`) |
| **Fallbacks de carregamento** | `components/fallbacks/` | Telas de espera do nível de aplicação (`FallbackType01`) |
| **SVG / Ícones inline** | `components/svg/` | Assets SVG convertidos em componentes React |
| **Compartilhado — área pública** | `components/public/shared/` | Peças comuns entre páginas públicas |
| **Compartilhado — área logada** | `components/user/shared/` | Cards, Avatar, Badge, Skeletons, Header |
| **Específico de tela** | `components/user/pages/{feature}/` | Componentes que pertencem a uma única rota |

**Regra prática:** se um componente for usado em mais de uma tela, ele sobe um nível para `shared/`. Se for usado em toda a aplicação, vai para `globals/`. Nunca copiar um componente entre pastas de feature — extrair para `shared/`.

---

## Design System / UI Kit

O frontend não usa uma biblioteca de componentes externa (sem Shadcn, sem Radix UI, sem Material). Todo o sistema visual é customizado sobre **Tailwind CSS v4**.

### Tokens de design

Os valores de cor, fundo e texto são definidos como variáveis CSS customizadas e consumidos via Tailwind:

```
--bg-secondary       → fundo de cards e painéis
--bg-tertiary        → fundo de elementos aninhados
--text-primary       → texto principal
--text-tertiary      → texto de apoio/secundário
--quaternary-color   → bordas e separadores
--sixth-color        → gradientes de fundo
--seventh-color      → cor base dos skeletons (animate-pulse)
```

Isso significa que trocar o tema (ex: dark → light) exige apenas reatribuir essas variáveis — os componentes não precisam ser alterados.

### Ícones

**React Icons** (v5) é a biblioteca de ícones. Importar sempre de um sub-pacote específico (ex: `react-icons/fi`) para evitar importar a coleção inteira.

### Utilitário `glass-card`

Existe uma classe utilitária customizada `glass-card` aplicada em cards e painéis principais (efeito glassmorphism). Centraliza o estilo visual dos containers sem repetir propriedades CSS em cada componente.

---

## Fronteiras de Erro (Error Boundaries)

O frontend usa o mecanismo nativo de **`errorElement` do React Router v7** para conter falhas de renderização e de loaders.

### Como está implementado

No roteador raiz (`src/routes/source.tsx`), o `errorElement` captura qualquer erro não tratado que ocorra dentro da árvore de rotas:

```tsx
{
  path: '/',
  errorElement: <ErrorPage />,        // captura erros da árvore inteira
  hydrateFallbackElement: <FallbackType01 />,
  children: [RoutePublic(), RouteUser()]
}
```

O `ErrorPage` global está em `components/globals/handling/errorPage.tsx`.  
A área logada tem sua própria versão em `components/user/shared/handling/errorPage.tsx`.

> **Pendente:** o componente `ErrorPage` global está como placeholder (`return <></>`). A tela de feedback amigável para o usuário ainda precisa ser implementada.

---

## Veja Também

- [Visão Geral](./visao-geral.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [Interface e Performance](./interface-performance.md)
