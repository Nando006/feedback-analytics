# Frontend — Visão Geral

## O Que É

O frontend (`apps/web`) é uma aplicação **React 19** com duas áreas distintas:

- **Área pública** — formulários de login, cadastro, recuperação de senha e coleta de feedback via QR Code (sem autenticação)
- **Área protegida** — dashboard da empresa com gestão de feedbacks, catálogo, QR Codes e painel de insights IA

## Tecnologias

| Tecnologia | Versão | Papel |
|---|---|---|
| **React** | 19.x | UI |
| **React Router DOM** | 7.x | Roteamento + data fetching (loaders/actions) |
| **React Hook Form + Zod** | 7.x / 4.x | Formulários com validação de schema |
| **Tailwind CSS** | 4.x | Estilização |
| **Supabase JS + SSR** | 2.x / 0.6.x | Client de autenticação (SSR) |
| **TypeScript** | 5.8.x | Tipagem estática |
| **Vite** | 7.x | Build tool |
| **Vitest + Testing Library** | 3.x | Testes unitários |

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
| `/user/edit/types-feedback` | Ativar tipos de feedback Premium |
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
- [Funcionalidades](../funcionalidades/visao-geral.md)
- [Padrões de Projeto](../padroes-projeto.md)
