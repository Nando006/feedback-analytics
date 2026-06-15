# 03 — Análise do estado atual das telas (as-is)

> Análise da arquitetura de informação **atual** da área logada, feita lendo as telas reais. Base para o [plano de reorganização](./03-plano-de-reorganizacao.md). Visão geral do item: [03-reorganizacao-das-telas-de-configuracao.md](./03-reorganizacao-das-telas-de-configuracao.md).

## Fontes lidas

Navegação: `apps/web/src/lib/mock/menu.ts`, `apps/web/components/user/layout/{Menu,Sidebar,Header}.tsx`, `apps/web/layouts/user.tsx`.
Telas/hubs: `apps/web/pages/user/profile.tsx`, `apps/web/pages/user/edit/{editTypeFeedbacks,editFeedbackSettings}.tsx`, `apps/web/components/user/shared/header.tsx`.

## Mapa de navegação atual

O **menu lateral** (única navegação global) tem 5 itens:

```
Perfil          → /user/profile
Catálogo        → /user/edit/feedback-settings        (é um "hub", não uma tela de conteúdo)
Dashboard       → /user/dashboard
Feedbacks ▸     (abre no hover)
   Recebidos    → /user/feedbacks/all
   Analisados ▸ (abre no hover — 3º nível)
        Todos · Positivos · Negativos
Insigths ▸      (sic — erro de digitação no código)
   Relatórios · Emocional · Estatísticas
```

Toda a **configuração vive fora do menu**, espalhada e escondida:

```
/user/profile  ── reúne 4 responsabilidades distintas:
   ├─ Dados pessoais (nome / e-mail / telefone)
   ├─ "QR Code da Empresa"        → link para /user/qrcode/enterprise
   ├─ "O que é Sua Empresa?"      → na prática é o contexto de IA (objetivo, resumo, meta)
   └─ "Deseja Definir Perguntas?" → na prática são as perguntas globais do formulário
        ↳ botão no topo "Configurações do Catálogo" → leva a /user/edit/types-feedback

/user/edit/types-feedback   ← só se chega por aquele botão do perfil
   ativa Produtos / Serviços / Departamentos
   (o link para o catálogo só aparece DEPOIS de salvar)

/user/edit/feedback-settings  ← item "Catálogo" do menu (é um hub de 3 cards)
   ├─ Produtos       → /user/edit/feedback-products
   ├─ Serviços       → /user/edit/feedback-services
   └─ Departamentos  → /user/edit/feedback-departments
         cada um reúne: itens do catálogo + perguntas por item + QR por item
```

## Mecânica da navegação

- **Sidebar por hover** (`layouts/user.tsx`, `Sidebar.tsx`): modos "empurra" e "sobrepõe"; no modo sobrepõe há uma **faixa invisível de 2px** na borda que abre o menu. Interação não descobrível; quebra no touch.
- **Submenus só no hover, até 3 níveis** (`Menu.tsx`): Feedbacks ▸ Analisados ▸ Todos. Frágil em telas pequenas.
- **Header global mistura navegação com uma feature** (`Header.tsx` + `InsightsControlsProvider` em `layouts/user.tsx`): além do botão de menu, exibe os **controles de Insights** (seletor de escopo + "Analisar feedbacks") em **todas** as telas — inclusive Perfil e Configuração, onde não se aplicam.

## Problemas por princípio de UX

| # | Princípio | O que acontece hoje |
|---|---|---|
| 1 | **"Onde estou?" (wayfinding)** | O `<h1>` de **toda** tela é o **nome da empresa**, nunca o nome da tela (`shared/header.tsx`). Sem breadcrumb. Menu não destaca a seção atual. |
| 2 | **"Para onde vou?"** | Navegação entre telas de config por botões `nextLink`/`prevLink` improvisados, com rótulos que não batem com o destino ("Configurações do Catálogo" leva a *Tipos*) e **todos com o mesmo ícone** de "usuário". |
| 3 | **Descoberta / visibilidade** | Tipos, Perguntas, QR e Clientes **não estão no menu**. Link do catálogo só aparece **depois de salvar** os tipos. |
| 4 | **Agrupamento (IA)** | "Perfil" acumula 4 responsabilidades. **Perguntas em 2 lugares** (globais no perfil, por-item no catálogo), com componentes distintos. **QR fragmentado** (geral numa tela; por-item dentro do catálogo). |
| 5 | **Linguagem do usuário** | Rótulos ≠ destino; jargão técnico ("O que é Sua Empresa?" = contexto de IA; rotas `feedback-settings`, `collecting-data-enterprise`); typo "Insigths". |
| 6 | **Reconhecer, não lembrar / contexto** | Controles de Insights em telas onde não pertencem; dois botões "salvar" por item (item × perguntas) dão sensação de "não salvou". |

## Diagnóstico em uma frase

> O sistema tem **as telas certas**, mas falta a **camada de orientação**: o usuário não vê onde está, não descobre a configuração pelo menu, e o fluxo natural (tipos → catálogo → perguntas → QR) está fatiado em telas desconexas com nomes que não correspondem ao que fazem.
