# Documentação — Feedback Analytics

A documentação está organizada em **três trilhas**, seguindo as fases de engenharia de software
e o momento em que cada artefato é produzido:

- **[Concepção](#concepção)** — *antes do código*, lado produto/negócio: quem usa, por quê, e quais
  regras e fluxos o sistema precisa atender (personas, stakeholders, modelo de negócio, casos de uso, design).
- **[Projeto Técnico](#projeto-técnico)** — *antes do código*, decisões técnicas: a arquitetura macro,
  a infraestrutura escolhida, os requisitos/funcionalidades planejados e a modelagem de dados.
- **[Implementação](#implementação)** — *concorrente ao código*: a referência viva de como o sistema
  foi construído (backend, frontend, banco, serviços, mecanismos, testes, CI/CD e instalação).

Documentos **transversais** (acompanham todo o ciclo) ficam na raiz.

---

## Transversais

- [Visão Geral do Projeto](./visao-geral.md) — porta de entrada: problema, solução e estrutura.
- [Changelog da Documentação](./changelog_documentacao.md) — versionamento e espelho das páginas no Notion.

---

## Concepção

> Pasta [`concepcao/`](./concepcao/) — análise e concepção do produto, antes do código.

- [Personas](./concepcao/personas.md) — perfis de usuário (Ana, Lucas, Carlos).
- [Stakeholders](./concepcao/stakeholder.md) — partes interessadas e seus interesses.
- [Modelo de Negócio](./concepcao/modelo-negocio.md) — proposta de valor, receita e métricas.
- [Decisão das Regras de Negócio](./concepcao/decisao_regras_negocio.md) — o **porquê** de cada regra,
  em linguagem acessível (o **como** técnico está em [Regras de Negócio](./implementacao/regras-negocio.md)).
- [Casos de Uso](./concepcao/casos-de-uso/visao-geral.md) — índice dos 12 UCs (UC-01 a UC-12).
- [Figma — Design](./concepcao/figma/) — product, assets e protótipos (baixa, média e alta fidelidade).

---

## Projeto Técnico

> Pasta [`projeto-tecnico/`](./projeto-tecnico/) — decisões técnicas tomadas antes de codar.

- [Arquitetura](./projeto-tecnico/arquitetura.md) — arquitetura macro (Serverless, monorepo, topologia)
  e infraestrutura escolhida (Vercel, Supabase, Gemini).
- [Requisitos e Funcionalidades](./projeto-tecnico/requisitos-e-funcionalidades.md) — RF, RNF e matriz de
  rastreabilidade (os mecanismos já implementados de cada funcionalidade estão em
  [Implementação → Funcionalidades](./implementacao/funcionalidades/)).
- [Modelagem de Dados (DER)](./projeto-tecnico/modelagem-de-dados.md) — entidades, relacionamentos e
  cardinalidades (o schema implementado vive em [Banco de Dados — Visão Geral](./implementacao/banco-de-dados/visao-geral.md)).
- [Decisão: Monorepo vs. Monolito](./projeto-tecnico/historico-de-decisoes/decisao-monorepo-vs-monolito.md) — análise da
  decisão de arquitetura (perfis de carga I/O-bound vs. CPU-bound, isolamento de falhas).

---

## Implementação

> Pasta [`implementacao/`](./implementacao/) — referência viva do código, mantida durante a codificação.

**Convenções e operação**
- [Padrões de Projeto](./implementacao/padroes-projeto.md) — convenções de código e camadas.
- [Workflows (CI/CD)](./implementacao/workflows.md) — pipelines, deploys e estratégia de branches.
- [Guia de Instalação](./implementacao/guia-instalacao.md) — setup do ambiente local.
- [Regras de Negócio](./implementacao/regras-negocio.md) — detalhamento técnico de como as regras são implementadas.

**Backend — API Gateway** ([`implementacao/backend/`](./implementacao/backend/))
- [Visão Geral](./implementacao/backend/visao-geral.md) · [Arquitetura e Estrutura](./implementacao/backend/arquitetura-estrutura.md) · [Endpoints](./implementacao/backend/endpoints.md)

**Frontend — React** ([`implementacao/frontend/`](./implementacao/frontend/))
- [Visão Geral](./implementacao/frontend/visao-geral.md) · [Arquitetura e Estrutura](./implementacao/frontend/arquitetura-estrutura.md) · [Fluxo de Autenticação](./implementacao/frontend/fluxo-autenticacao.md) · [System Design](./implementacao/frontend/system-design.md) · [Interface e Performance](./implementacao/frontend/interface-performance.md)

**Banco de Dados** ([`implementacao/banco-de-dados/`](./implementacao/banco-de-dados/))
- [Visão Geral](./implementacao/banco-de-dados/visao-geral.md) — schema, RLS, triggers, funções e índices (o DER conceitual está em [Projeto Técnico → Modelagem de Dados](./projeto-tecnico/modelagem-de-dados.md)).

**Serviços** ([`implementacao/servicos/`](./implementacao/servicos/))
- IA Analyze: [Visão Geral](./implementacao/servicos/ia-analyze/visao-geral.md) · [Arquitetura e Estrutura](./implementacao/servicos/ia-analyze/arquitetura-estrutura.md) · [Endpoints](./implementacao/servicos/ia-analyze/endpoints.md)

**Funcionalidades — mecanismos implementados** ([`implementacao/funcionalidades/`](./implementacao/funcionalidades/))
- Painel de insights, filtro semântico de IA, anti-spam por fingerprint, bloqueio de dispositivo, coleta por QR Code, QR Code por escopo, onboarding de catálogo e higienização JWT/LGPD.

**Testes** ([`implementacao/testes/`](./implementacao/testes/))
- [Visão Geral](./implementacao/testes/visao-geral.md) · [Plano de Teste Estratégico](./implementacao/testes/plano-estrategico.md) · [Frontend](./implementacao/testes/web.md) · [IA Analyze](./implementacao/testes/ia-analyze.md) · [API Gateway](./implementacao/testes/api-gateway.md) · [Lacunas E2E](./implementacao/testes/lucanas_e2e.md)
