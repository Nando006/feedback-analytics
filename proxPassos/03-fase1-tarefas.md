# 03 — Fase 1 (Orientação / Wayfinding): tarefas de implementação

> Detalhamento da **Fase 1** do [plano de reorganização](./03-plano-de-reorganizacao.md). Objetivo da fase: instalar a **camada de orientação** (onde estou / para onde vou / cadê a configuração) **sem mexer em rotas nem na lógica das telas**. É o ganho rápido e de baixo risco.

## Princípio da fase

- **NÃO** criar rotas novas (isso é Fase 2). O menu reagrupado aponta para as **rotas que já existem**.
- **NÃO** alterar estado/regras das telas. Mexemos em **navegação, cabeçalho e layout**.
- Resultado esperado: o usuário vê o nome da tela, uma trilha (breadcrumb), a configuração no menu e a conta no topo.

## Acoplamentos descobertos (ler antes de começar)

| Fato | Onde | Impacto na fase |
|---|---|---|
| Header de página é usado em **6 telas** | `apps/web/pages/user/profile.tsx`, `apps/web/pages/user/edit/{editTypeFeedbacks,editFeedbackSettings,editFeedbackProducts,editFeedbackServices,editFeedbackDepartments}.tsx` (import de `components/user/shared/header`) | Migração do `PageHeader` toca essas 6 + telas sem header (dashboard, feedbacks, insights) |
| Badge de plano (TRIAL/ACTIVE/…) está no header de página | `getSubscriptionBadge` em `apps/web/components/user/shared/header.tsx` | Reaproveitar no menu de conta (T4) |
| Contexto de Insights consumido pelo **dashboard** | `apps/web/pages/user/dashboard.tsx:29` lê `scope, catalogItemId` | Tirar o seletor do header global afeta o filtro de escopo do dashboard → **decisão na T5** |
| Identidade + logout no rodapé da sidebar | `apps/web/components/user/shared/cards/cardProfile.tsx` (usado em `Sidebar.tsx`) | Mover para o menu de conta no topo (T4) |
| Testes mockam o header e o contexto | `apps/web/pages/tests/profile.test.tsx` (mock de `shared/header`), `apps/web/pages/tests/dashboard.test.tsx` (mock de `useInsightsControls`) | Atualizar mocks junto com T2/T5 |

---

## Tarefas

### T1 — Fonte única de wayfinding (`routeMeta`)
- **Criar** `apps/web/src/lib/constants/routes/routeMeta.ts` com um mapa `pathname → { title, description?, breadcrumb: {label, to?}[] }` cobrindo todas as rotas `/user/*`, e um helper `getRouteMeta(pathname)` (com fallback).
- Ex.: `/user/edit/feedback-products` → `{ title: 'Catálogo de Produtos', breadcrumb: [{label:'Configuração da coleta'}, {label:'Catálogo', to:'/user/edit/feedback-settings'}, {label:'Produtos'}] }`.
- **Pronto quando:** `getRouteMeta` devolve título + trilha para toda rota logada.
- **Dependência:** nenhuma. É a base de T2 e do breadcrumb.

### T2 — Componente `PageHeader` (substitui o header de página atual)
- **Criar** `apps/web/components/user/shared/PageHeader.tsx`: **breadcrumb** + **`<h1>` = título da TELA** + descrição opcional + **slot de ações** (`children`/`actions`). Lê o `routeMeta` (T1) pelo `useLocation`, ou recebe `title`/`breadcrumb` por prop.
- **Substituir** o `Header` de `components/user/shared/header.tsx` nas 6 telas que o usam. Remover dali o nome-da-empresa-como-título e os `nextLink`/`prevLink` improvisados.
- **Adicionar** o `PageHeader` nas telas que hoje não têm cabeçalho consistente: `dashboard.tsx`, `feedbacks/all`, `feedbacks/analytics/*`, `insights/*`, `qrcodes/*`, `edit/customers`.
- **Pronto quando:** toda tela mostra breadcrumb + seu próprio título; nenhum `<h1>` é o nome da empresa.
- **Dependência:** T1. Atualizar o mock em `pages/tests/profile.test.tsx`.
- **Obs.:** manter o `shared/header.tsx` antigo até concluir a migração; remover ao final (ou aposentar `getSubscriptionBadge` movendo-o para um util reutilizado pela T4).

### T3 — Menu reagrupado + item ativo
- **Reescrever** `apps/web/src/lib/mock/menu.ts` com a nova estrutura, **apontando para as rotas atuais** (sem rotas novas):
  - `Visão geral` → `/user/dashboard`
  - `Feedbacks` → Recebidos (`/user/feedbacks/all`) · Análises (`/user/feedbacks/analytics/all|positive|negative`)
  - `Insights` → Relatórios/Emocional/Estatísticas (corrigir **"Insigths" → "Insights"**)
  - `Configuração da coleta` → Dados da empresa (`/user/edit/collecting-data-enterprise` ou ponto do perfil) · Tipos de coleta (`/user/edit/types-feedback`) · Catálogo & perguntas (`/user/edit/feedback-settings`) · QR Codes (`/user/qrcode/enterprise`)
  - `Clientes` → `/user/edit/customers`
- **No `Menu.tsx`:** destacar **item/seção ativos** com `NavLink` `isActive` + `aria-current="page"` (hoje só há `data-pending-current` durante a navegação). Manter a seção Configuração expansível.
- **Pronto quando:** a Configuração aparece no menu e o item atual fica destacado.
- **Dependência:** alinhar rótulos com T1.
- **Obs.:** a troca de hover→clique do submenu e o drawer mobile ficam para a **Fase 4** — aqui só reagrupar e marcar ativo.

### T4 — Menu de conta no topo (identidade)
- **Criar** um menu de conta no header global (`components/user/layout/Header.tsx`): **nome da empresa** + **badge de plano** (reaproveitar `getSubscriptionBadge`) + itens **"Minha conta"** (`/user/profile` por ora) e **"Sair"** (reusar `onSignOut`/`INTENT_LOGOUT`).
- **Ajustar** a `Sidebar.tsx`/`CardProfile`: tirar o card de perfil+logout do rodapé (a identidade e o sair passam para o topo). Decidir se a sidebar mantém um rodapé enxuto ou nada.
- **Pronto quando:** nome + plano + "Sair" acessíveis no topo, em todas as telas; sidebar sem o card duplicado.
- **Dependência:** coordenar com T2 (badge) e T6 (composição do header).

### T5 — Tirar os controles de Insights do header global
- **Remover** `<InsightsHeaderControls>` e o `useInsightsControls` de `components/user/layout/Header.tsx`.
- **Renderizar** `<InsightsHeaderControls>` **dentro da tela de Insights** (`pages/user/feedbacks/insights/feedbackInsightsReport.tsx`), no topo da página (via `PageHeader` actions). Avaliar se Emocional/Estatísticas também precisam.
- **Manter** o `InsightsControlsProvider` no `layouts/user.tsx` (não mexer no estado).
- **⚠️ DECISÃO (dashboard):** o dashboard filtra métricas pelo `scope`/`catalogItemId` que hoje vêm do header global. Ao remover o seletor de lá, escolher:
  - **(a) Recomendado** — adicionar um seletor de escopo **local** no dashboard (renderiza `ScopeSelectorRadial` a partir do contexto que já existe). Só adiciona UI, não muda lógica.
  - **(b)** dashboard fica fixo em `COMPANY` até a Fase 2 (mais simples, perde o filtro por escopo no dashboard).
- **Pronto quando:** o header global não mostra mais controles de IA; eles aparecem só na tela de Insights (+ seletor no dashboard se opção (a)).
- **Dependência:** toca `Header.tsx` (coordenar com T4/T6). Atualizar `pages/tests/dashboard.test.tsx`.

### T6 — Recompor o header global e limpar
- **Reorganizar** `components/user/layout/Header.tsx` para: `[botão menu] [breadcrumb] … [menu de conta]`. Mostrar o breadcrumb a partir do `routeMeta` (ou deixá-lo só no `PageHeader` — decidir um lugar canônico para evitar duplicar).
- **Remover** código morto resultante (props/imports do Insights no header; `shared/header.tsx` antigo, se totalmente migrado).
- **Pronto quando:** header coerente e enxuto em todas as telas; sem componentes órfãos.
- **Dependência:** T2, T4, T5.

---

## Ordem sugerida

```
T1 (routeMeta)
  → T3 (menu reagrupado + ativo)     ← ganho de descoberta visível cedo
  → T2 (PageHeader nas telas)        ← wayfinding por tela
  → T4 + T5 + T6 (header global)     ← agrupar: todos mexem em Header.tsx
  → atualizar testes (profile, dashboard) e remover código morto
```

## Decisões a confirmar antes/junto

1. **Dashboard × escopo (T5):** opção (a) seletor local agora, ou (b) fixar em COMPANY até a Fase 2.
2. **Breadcrump: um lugar só** — no `PageHeader` (no corpo) ou no header global (topo)? Evitar duplicar.
3. **Rótulo da seção** — "Configuração da coleta" (assumido) × outro.

## Impacto em testes

- `apps/web/pages/tests/profile.test.tsx` — mocka `components/user/shared/header`; atualizar para o `PageHeader`.
- `apps/web/pages/tests/dashboard.test.tsx` — mocka `useInsightsControls`; ajustar conforme a decisão da T5.
- Adicionar teste do `getRouteMeta` (T1) e, se possível, do `PageHeader` (render de título/breadcrumb).

## Definition of Done — Fase 1

- [ ] Toda tela logada exibe **breadcrumb + título da própria tela** (nenhum título é o nome da empresa).
- [ ] O menu contém a seção **Configuração da coleta** e destaca o item ativo; "Insights" sem typo.
- [ ] Identidade da conta + **Sair** no **menu de conta no topo**; sidebar sem o card duplicado.
- [ ] Header global **sem** os controles de Insights; controles na tela de Insights (e seletor no dashboard, se opção (a)).
- [ ] Testes atualizados e verdes; sem código morto (`shared/header.tsx` antigo removido se migrado).
- [ ] Nenhuma rota nova nem mudança de regra de negócio (escopo respeitado).
