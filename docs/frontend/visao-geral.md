# Frontend — Visão Geral

## O Que É

O frontend (`apps/web`) é uma aplicação **React 19** com duas áreas distintas:

- **Área pública** — formulários de login, cadastro, recuperação de senha e coleta de feedback via QR Code (sem autenticação)
- **Área protegida** — dashboard da empresa com gestão de feedbacks, catálogo, QR Codes e painel de insights IA

## Tecnologias

### Runtime

| Tecnologia | Versão | Papel |
|---|---|---|
| **React** | 19.x | Biblioteca de UI |
| **React Router DOM** | 7.x | Roteamento SPA + data fetching (loaders/actions) |
| **React Hook Form** | 7.x | Gerenciamento de estado de formulários |
| **@hookform/resolvers** | 5.x | Integração do React Hook Form com schemas Zod |
| **Zod** | 4.x | Validação e parsing de schemas |
| **Tailwind CSS** | 4.x | Estilização utilitária |
| **Supabase JS** | 2.x | Client do Supabase (auth, queries) |
| **@supabase/ssr** | 0.6.x | Adaptador SSR para gerenciamento de sessão |
| **React Icons** | 5.x | Biblioteca de ícones |
| **TypeScript** | 5.8.x | Tipagem estática |

### Build

| Tecnologia | Versão | Papel |
|---|---|---|
| **Vite** | 7.x | Build tool e dev server |
| **@vitejs/plugin-react** | 4.x | Suporte a React (Fast Refresh + JSX) no Vite |

### Testes

| Tecnologia | Versão | Papel |
|---|---|---|
| **Vitest** | 3.x | Runner de testes unitários |
| **@vitest/coverage-v8** | 3.x | Relatório de cobertura de código via V8 |
| **@testing-library/react** | 16.x | Renderização de componentes em testes |
| **@testing-library/user-event** | 14.x | Simulação de interações do usuário |
| **@testing-library/jest-dom** | 6.x | Matchers customizados para DOM |
| **jsdom** | 27.x | Ambiente DOM simulado para os testes |

### Qualidade de Código

| Tecnologia | Versão | Papel |
|---|---|---|
| **ESLint** | 9.x | Linting de código |
| **typescript-eslint** | 8.x | Regras de lint específicas para TypeScript |

---

## Mapa de Rotas

### Área Pública

| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/login` | Login da empresa |
| `/register` | Cadastro |
| `/forgot-password` | Recuperação de senha |
| `/auth/reset-password` | Redefinição de senha |
| `/auth/success` | Confirmação de autenticação (e-mail verificado) |
| `/feedback/qrcode` | Formulário público de coleta via QR Code |

### Área Protegida (`/user/*`)

| Rota | Descrição |
|---|---|
| `/user/dashboard` | Dashboard principal |
| `/user/profile` | Perfil + QR Code da empresa |
| `/user/feedbacks/all` | Todos os feedbacks |
| `/user/feedbacks/:id` | Detalhes de um feedback individual |
| `/user/feedbacks/analytics/all` | Analytics geral dos feedbacks |
| `/user/feedbacks/analytics/positive` | Analytics de feedbacks positivos |
| `/user/feedbacks/analytics/negative` | Analytics de feedbacks negativos |
| `/user/insights/reports` | Painel de insights IA |
| `/user/insights/emotional` | Análise emocional |
| `/user/insights/statistics` | Estatísticas |
| `/user/edit/types-feedback` | Ativar tipos de feedback (produtos, serviços, departamentos) |
| `/user/edit/feedback-settings` | Hub de configurações de catálogo |
| `/user/edit/feedback-products` | Catálogo de produtos |
| `/user/edit/feedback-services` | Catálogo de serviços |
| `/user/edit/feedback-departments` | Catálogo de departamentos |
| `/user/edit/customers` | Gerenciamento de clientes |
| `/user/edit/collecting-data-enterprise` | Configuração de dados de coleta da empresa |
| `/user/qrcode/enterprise` | QR Code da empresa |
| `/user/qrcode/products` | QR Code do catálogo de produtos |
| `/user/qrcode/services` | QR Code do catálogo de serviços |
| `/user/qrcode/departments` | QR Code do catálogo de departamentos |

---

## Padrão de Data Fetching

O frontend usa exclusivamente o padrão **loader/action do React Router v7**.

- **Loaders:** executados antes da renderização da rota. Dados disponíveis via `useRouteLoaderData`.
- **Actions:** processam mutations (submissões de formulário). Resultado via `useActionData`.

---

## Autenticação

O `@supabase/ssr` gerencia a sessão. O loader raiz `LoaderUserProtected` verifica a sessão antes de renderizar qualquer página protegida e redireciona para `/login` caso inválida.

---

## Veja Também

- [Arquitetura e Componentes](./arquitetura-estrutura.md)
- [System Design](./system-design.md)
- [Interface e Performance](./interface-performance.md)
- [Fluxo de Autenticação e Navegação](./fluxo-autenticacao.md)
- [Funcionalidades](../funcionalidades/visao-geral.md)
- [Padrões de Projeto](../padroes-projeto.md)
