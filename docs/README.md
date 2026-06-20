# Documentação — Feedback Analytics

A documentação está dividida em **duas trilhas**, conforme o momento em que cada artefato é produzido:

- **[Concepção e Projeto](#concepção-e-projeto)** — feita **antes do código**: análise, requisitos,
  design e decisões tomadas antes de implementar (personas, stakeholders, modelo de negócio, casos
  de uso, protótipos, decisões de arquitetura).
- **[Documentação Técnica](#documentação-técnica)** — feita **concorrente ao código**: referência
  viva produzida e mantida durante a codificação (arquitetura, padrões, backend/frontend/banco/
  serviços, funcionalidades, testes, CI/CD e instalação).

Documentos **transversais** (acompanham todo o ciclo) ficam na raiz.

---

## Transversais

- [Visão Geral do Projeto](./visao-geral.md) — porta de entrada: problema, solução e estrutura.
- [Changelog da Documentação](./changelog_documentacao.md) — versionamento e espelho das páginas no Notion.

---

## Concepção e Projeto

> Pasta [`concepcao-projeto/`](./concepcao-projeto/)

- [Personas](./concepcao-projeto/personas.md) — perfis de usuário (Ana, Lucas, Carlos).
- [Stakeholders](./concepcao-projeto/stakeholder.md) — partes interessadas e seus interesses.
- [Modelo de Negócio](./concepcao-projeto/modelo-negocio.md) — proposta de valor, receita e métricas.
- [Decisão das Regras de Negócio](./concepcao-projeto/decisao_regras_negocio.md) — o **porquê** de cada
  regra, em linguagem acessível (o **como** técnico está em [Regras de Negócio](./tecnica/regras-negocio.md)).
- [Casos de Uso](./concepcao-projeto/casos-de-uso/visao-geral.md) — índice dos 12 UCs (UC-01 a UC-12).
- [Figma — Design](./concepcao-projeto/figma/) — product, assets e protótipos (baixa, média e alta fidelidade).
- [Dúvidas / Decisões de Arquitetura](./concepcao-projeto/duvidas/) — ex.: monorepo serverless vs. monolito.

> **Requisitos (RF/RNF):** o artefato de requisitos funcionais e não-funcionais vive em
> [Funcionalidades — Visão Geral](./tecnica/funcionalidades/visao-geral.md) (mantido junto dos
> detalhes técnicos das funcionalidades, por coesão de pasta).

---

## Documentação Técnica

> Pasta [`tecnica/`](./tecnica/)

**Visão macro e convenções**
- [Arquitetura](./tecnica/arquitetura.md) — infraestrutura Serverless, monorepo e topologia.
- [Padrões de Projeto](./tecnica/padroes-projeto.md) — convenções de código e camadas.
- [Workflows (CI/CD)](./tecnica/workflows.md) — pipelines, deploys e estratégia de branches.
- [Guia de Instalação](./tecnica/guia-instalacao.md) — setup do ambiente local.
- [Regras de Negócio](./tecnica/regras-negocio.md) — detalhamento técnico de como as regras são implementadas.

**Backend — API Gateway** ([`tecnica/backend/`](./tecnica/backend/))
- [Visão Geral](./tecnica/backend/visao-geral.md) · [Arquitetura e Estrutura](./tecnica/backend/arquitetura-estrutura.md) · [Endpoints](./tecnica/backend/endpoints.md)

**Frontend — React** ([`tecnica/frontend/`](./tecnica/frontend/))
- [Visão Geral](./tecnica/frontend/visao-geral.md) · [Arquitetura e Estrutura](./tecnica/frontend/arquitetura-estrutura.md) · [Fluxo de Autenticação](./tecnica/frontend/fluxo-autenticacao.md) · [System Design](./tecnica/frontend/system-design.md) · [Interface e Performance](./tecnica/frontend/interface-performance.md)

**Banco de Dados** ([`tecnica/banco-de-dados/`](./tecnica/banco-de-dados/))
- [Visão Geral](./tecnica/banco-de-dados/visao-geral.md) · [Diagrama de Entidade-Relacionamento](./tecnica/banco-de-dados/diagrama-entidade-relacionamento.md)

**Serviços** ([`tecnica/servicos/`](./tecnica/servicos/))
- IA Analyze: [Visão Geral](./tecnica/servicos/ia-analyze/visao-geral.md) · [Arquitetura e Estrutura](./tecnica/servicos/ia-analyze/arquitetura-estrutura.md) · [Endpoints](./tecnica/servicos/ia-analyze/endpoints.md)

**Funcionalidades** ([`tecnica/funcionalidades/`](./tecnica/funcionalidades/))
- [Visão Geral (Requisitos e Funcionalidades)](./tecnica/funcionalidades/visao-geral.md) e os mecanismos: painel de insights, filtro semântico de IA, anti-spam por fingerprint, bloqueio de dispositivo, coleta por QR Code, QR Code por escopo, onboarding de catálogo e higienização JWT/LGPD.

**Testes** ([`tecnica/testes/`](./tecnica/testes/))
- [Visão Geral](./tecnica/testes/visao-geral.md) · [Plano de Teste Estratégico](./tecnica/testes/plano-estrategico.md) · [Frontend](./tecnica/testes/web.md) · [IA Analyze](./tecnica/testes/ia-analyze.md) · [API Gateway](./tecnica/testes/api-gateway.md) · [Lacunas E2E](./tecnica/testes/lucanas_e2e.md)
