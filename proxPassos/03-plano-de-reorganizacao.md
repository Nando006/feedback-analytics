# 03 — Plano de reorganização das telas (to-be)

> Plano de reestruturação da área logada, derivado da [análise do estado atual](./03-analise-atual-das-telas.md). Visão geral do item: [03-reorganizacao-das-telas-de-configuracao.md](./03-reorganizacao-das-telas-de-configuracao.md).

| Campo | Valor |
|---|---|
| **Status** | 🟡 Planejado |
| **Foco** | Onboarding (1ª configuração) **e** uso recorrente |
| **Profundidade** | Reestruturação ampla (nova arquitetura de informação + rotas + wayfinding) |
| **Camadas** | Frontend (navegação, rotas, layout, telas de `edit/*` e `profile`) |

## Objetivo

Tornar a área logada **autoexplicativa**: o gestor deve, sozinho, saber **onde está**, descobrir **onde fica cada coisa** e completar a configuração da coleta **sem ajuda**. Atacamos as duas frentes da análise: a **camada de orientação** (wayfinding) e o **agrupamento** das telas.

## Princípios de design (boas práticas que guiam tudo)

1. **Orientação sempre visível** — título da tela + breadcrumb + item de menu ativo. (Nielsen #1, visibilidade do estado.)
2. **Navegação persistente e completa** — a configuração mora no menu, numa seção própria; nada de acesso só por botão escondido.
3. **Agrupar pela tarefa do usuário** — linguagem de objetivo, não de tabela do banco. (Nielsen #2, match com o mundo real.)
4. **Fluxo guiado para o que é sequencial** — a 1ª configuração é um passo-a-passo com progresso visível; depois vira hub de status.
5. **Progressive disclosure** — mostrar o essencial; revelar o avançado sob demanda.
6. **Consistência** — um único padrão de cabeçalho, ícones com significado, rótulo = destino. (Nielsen #4.)

---

## 1. Nova arquitetura de informação (menu to-be)

Menu reagrupado por objetivo, com a **Configuração** promovida a seção de primeira classe e ordenada pelo fluxo natural:

```
◆ Visão geral                  /user/dashboard

◆ Feedbacks
   – Recebidos                 /user/feedbacks/all
   – Análises (todos/+/–)      /user/feedbacks/analytics/*

◆ Insights (IA)
   – Relatórios / Emocional / Estatísticas

◆ Configuração da coleta        ← seção nova; abre no "Assistente" (item 4 abaixo)
   – Dados da empresa          (contexto para a IA)
   – Tipos de coleta           (produtos / serviços / departamentos)
   – Catálogo & perguntas      (itens + perguntas por item)
   – Perguntas gerais          (valem para toda a empresa)
   – QR Codes                  (geral + por item, num lugar só)

◆ Clientes                     /user/clientes

────────────────────────────────
[topo direito, fixo] Conta da empresa ▾  (nome + status do plano · Minha conta · Sair)
```

Mudanças de fundo:
- **"Configuração da coleta" entra no menu** — hoje não existe lá.
- **Identidade da conta sai do corpo das telas** e vira um menu fixo no topo (nome da empresa + badge de plano + "Minha conta" + "Sair"). Hoje isso é o `<h1>` de cada página.
- **Feedbacks/Insights** quase não mudam de estrutura (não são a dor) — só nomes e o item ativo.

## 2. Wayfinding — padrão único de orientação

- **Novo componente `PageHeader`** (substitui o `shared/header.tsx` atual) com, em toda tela:
  - **Breadcrumb** (ex.: `Configuração › Catálogo › Produtos`).
  - **Título = nome da TELA** (`<h1>`), não o nome da empresa.
  - **Descrição** curta e **slot de ações** da página (ex.: "Adicionar item").
- **Menu com estado ativo** destacado (a seção e o item atuais).
- **Tirar os controles de Insights do header global** (`Header.tsx`): eles passam a viver **dentro da tela de Insights**, onde o escopo faz sentido. O header global fica com: botão de menu + breadcrumb + menu de conta.
- **Sidebar:** abrir por **clique** (não hover), com estado lembrado; em telas pequenas vira **drawer**. Aposentar a faixa invisível de 2px.

## 3. Reagrupamento das telas

| Hoje | Proposto |
|---|---|
| **Perfil** mistura dados pessoais + QR + contexto de IA + perguntas globais | **Dividir:** `Minha conta` (dados pessoais + plano) **e** `Dados da empresa` (contexto de IA, dentro de Configuração) |
| **Perguntas globais** escondidas no Perfil; **perguntas por item** dentro do catálogo; componentes distintos | **Unificar** num componente único de perguntas. Deixar a **relação clara**: "Perguntas gerais" (empresa) × "Perguntas por item" (sobrepõem as gerais naquele item). Edição central + atalho inline no item. |
| **QR** geral numa tela + **QR por item** embutido no catálogo + rotas-action vazias (`qrcode/products|services|departments`) | **Uma tela "QR Codes"** lista o geral e os por-item (preview, download, ativar/desativar). Remover as rotas-action vazias. |
| **"Catálogo"** (menu) → hub `feedback-settings` que só redireciona | Hub vira parte da seção **Configuração**, alcançável e nomeado de forma clara |

## 4. Onboarding guiado (atende "os dois" com uma só estrutura)

- A entrada da seção **Configuração da coleta** é um **Assistente de configuração** (`/user/config`) que mostra os passos com **status** e progresso:
  ```
  Configuração da coleta                         ▓▓▓▓▓░░░  3/5
  ✓ Dados da empresa            (preenchido)
  ✓ Tipos de coleta             (Produtos, Serviços)
  ◔ Catálogo & perguntas        (2 de 3 catálogos com itens)
  ○ Perguntas gerais            (pendente)
  ○ QR Codes                    (nenhum ativo)
  ```
- **Para o gestor novo:** funciona como wizard (o "próximo passo" é sempre óbvio).
- **Para o gestor recorrente:** a mesma tela é um **hub com status**, atalho para qualquer área.
- **Reforço no Dashboard:** um cartão "Configuração X% completa" enquanto houver pendências, com link para o passo que falta. (Hoje o link aparece/some condicionalmente — vira um indicador claro e estável.)

## 5. Nomenclatura (linguagem do usuário)

| Atual | Proposto |
|---|---|
| "Insigths" (menu) | **Insights** (corrige o typo) |
| "Catálogo" (menu) → `feedback-settings` | **Configuração da coleta** (seção) |
| "O que é Sua Empresa?" | **Dados da empresa** (subtítulo: "contexto para a IA") |
| "Deseja Definir Perguntas Objetivas?" | **Perguntas do formulário** |
| `types-feedback` | **Tipos de coleta** |
| `collecting-data-enterprise` | **Dados da empresa** |
| botão "Configurações do Catálogo" | (removido — navegação vira menu + breadcrumb) |

## 6. Esquema de rotas (com redirects)

Rotas mais legíveis sob `/user/config/*`, **mantendo redirects** das antigas (não quebram bookmarks; QR impressos apontam para rotas **públicas**, então a config pode mudar à vontade):

| Antiga | Nova |
|---|---|
| `/user/profile` | `/user/conta` (dados pessoais + plano) |
| `/user/edit/collecting-data-enterprise` | `/user/config/empresa` |
| `/user/edit/types-feedback` | `/user/config/tipos` |
| `/user/edit/feedback-settings` | `/user/config/catalogo` |
| `/user/edit/feedback-{products,services,departments}` | `/user/config/catalogo/{produtos,servicos,departamentos}` |
| (novo) | `/user/config/perguntas` |
| (novo) | `/user/config/qrcodes` |
| `/user/qrcode/enterprise` + rotas-action | `/user/config/qrcodes` |
| `/user/edit/customers` | `/user/clientes` |
| (novo, entrada da seção) | `/user/config` (Assistente) |

## Plano de implementação em fases

Reestruturação ampla, mas entregue em ondas que já dão valor e podem ser validadas com usuário.

1. **Fase 1 — Orientação (wayfinding):** componente `PageHeader` (título da tela + breadcrumb), menu reagrupado com a seção **Configuração**, estado ativo no menu, **remover** os controles de Insights do header global e mover a identidade da conta para um menu de topo. *Sem mexer na lógica das telas.* Já elimina as dores #1, #2, #3 e #5 da análise.
2. **Fase 2 — Reagrupamento (rotas + telas):** novas rotas `/user/config/*` com redirects; **dividir** Perfil em `Minha conta` + `Dados da empresa`; **centralizar** QR numa tela; **unificar** o componente de Perguntas e deixar a relação geral×item explícita.
3. **Fase 3 — Onboarding guiado:** tela `/user/config` (Assistente com passos + status) e o cartão de progresso no Dashboard.
4. **Fase 4 — Polimento:** nomenclatura/microcopy final, sidebar por clique + drawer mobile, acessibilidade (foco, teclado), remoção das rotas-action vazias.

## Validação e cuidados

- **Protótipo antes da Fase 2:** desenhar o novo menu, o `PageHeader` e o Assistente no Figma e validar com um gestor real antes de mexer em rotas. (Atualizar `docs/figma/`.)
- **Documentação:** ao mudar rotas/nomes, atualizar [UC-06](../docs/casos-de-uso/uc-06-ativacao-tipos-feedback.md), [UC-07](../docs/casos-de-uso/uc-07-configuracao-catalogo.md), [UC-12](../docs/casos-de-uso/uc-12-gestao-perfil.md) e os protótipos.
- **Encaixe com o [item 04 (preview do formulário)](./04-preview-do-formulario.md):** o preview ao vivo entra naturalmente na tela de "Catálogo & perguntas" da Fase 2/3.
- **Decisões em aberto:** rótulos finais da seção (ex.: "Configuração da coleta" × "Coleta" × "Formulário"); se "Perguntas gerais" e "Catálogo & perguntas" são duas entradas de menu ou uma só com abas — resolver no protótipo.
