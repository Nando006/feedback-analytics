# Arquitetura do Sistema

## Visão Geral

O projeto é um **monorepo multidomínios** gerenciado com npm Workspaces. Cada domínio tem escopo, responsabilidade e ciclo de execução próprios, mas compartilham versionamento único e dependências cruzadas via pacote `shared`.

| Domínio | Tipo | Descrição |
|---|---|---|
| `frontend` | React SPA | Interface do usuário — área pública (QR Code) e painel da empresa |
| `gateway` | API Gateway / BFF | Hub central — autenticação, regras de negócio, orquestração |
| `shared` | Cross-Package | Tipos, interfaces e contratos compartilhados entre domínios |
| `services/ia-analyze` | Serviço Externo | Processamento de IA com escopo e volume próprios |
| `services/*` | Serviços Externos | Integrações menores agrupadas em um único domínio de serviços |

---

## Responsabilidades por Camada

**Monorepo Multidomínio**
Organiza aplicações, serviços e libs no mesmo repositório com versionamento único e execução independente por domínio. Evita duplicação de dependências e garante consistência de contratos.

**Frontend React SPA**
Responsável pela experiência do usuário, navegação via React Router (loaders/actions), e consumo das APIs do Gateway. Nunca acessa o banco ou serviços de IA diretamente.

**API Gateway (padrão BFF)**
Ponto único de entrada para o frontend. Concentra autenticação (JWT via Supabase Auth), orquestração das regras de negócio, integração com o banco de dados (Supabase com RLS) e coordenação das chamadas aos serviços externos.

**Shared Cross-Package**
Pacote interno importado por múltiplos domínios. Evita duplicação de tipos TypeScript — contratos de API, interfaces de entidades e tipos de integração vivem aqui e são a fonte de verdade para todos os serviços.

**Serviços Externos (Microserviços)**
Divididos em dois perfis: integrações de menor impacto são agrupadas em um único domínio `services/`; serviços de grande volume ou complexidade (como o IA Analyze) ganham domínio próprio para escalar e evoluir de forma independente.

---

## Como os Serviços se Conectam

O sistema tem uma topologia **hub-and-spoke**: o API Gateway é o hub central. O frontend nunca fala diretamente com o banco ou com o serviço de IA — tudo passa pelo Gateway.

### Área Pública (sem login)

1. O cliente escaneia o QR Code físico — a URL contém um identificador único do ponto de coleta
2. O Frontend pede ao Gateway os dados daquele ponto (formulário configurado, perguntas)
3. O cliente preenche e submete; o Gateway valida o **fingerprint do dispositivo** (anti-spam) e insere o feedback no banco

### Área Protegida (empresa logada)

1. O Frontend autentica via **Supabase Auth** e obtém um JWT
2. Todas as requisições ao Gateway carregam esse JWT no header `Authorization`
3. O middleware `requireAuth` valida o token e injeta `req.user` + `req.supabase` na request
4. O Gateway lê/escreve no banco (Supabase) e, quando necessário, chama o IA Analyze

### Fluxo de Análise IA

1. A empresa clica em "Analisar feedbacks" no painel de insights
2. O Gateway busca feedbacks não analisados (máx. 100), remove IDs já presentes em `feedback_analysis` e agrupa em **batches por escopo** (`COMPANY`, `PRODUCT`, `SERVICE`, `DEPARTMENT`)
3. Envia o payload `{ enterprise_context, batches[] }` ao IA Analyze via HTTP com token interno
4. O IA Analyze chama o **provedor LLM externo** por batch, processa e sanitiza sentimentos, keywords e categorias
5. O Gateway persiste as análises em `feedback_analysis` e os insights em `feedback_insights_report`

---

## Contratos Compartilhados

Os tipos TypeScript que transitam entre Gateway e IA Analyze **não são duplicados**. Vivem em `shared/interfaces/contracts/ia-analyze/` e são importados pelos dois serviços:

| Arquivo | Propósito |
|---|---|
| `scope.contract.ts` | Tipos base: `IaAnalyzeScopeType`, `IaAnalyzeSentiment` |
| `input.contract.ts` | Contexto de empresa + estrutura de feedback bruto |
| `remote.contract.ts` | Contrato de integração interna Gateway ↔ IA Analyze |
| `run.contract.ts` | Contrato da API pública (requests/responses) |
| `analysis.contract.ts` | Estruturas de saída: itens analisados, insights, contexto |

---

## Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React | 19.x |
| Roteamento / Data Fetching | React Router DOM | 7.x |
| Formulários | React Hook Form + Zod | 7.x / 4.x |
| Estilo | Tailwind CSS | 4.x |
| Build | Vite | — |
| Backend Runtime | Node.js | 20.x |
| Backend Framework | Express | — |
| Autenticação | Supabase JS | 2.x |
| Banco de Dados | Supabase (PostgreSQL) | — |
| IA | Provedor LLM Externo Configurável (via API REST) | — |
| Testes | Vitest + Testing Library | — |
| Monorepo | npm Workspaces + concurrently | — |

---

## Veja Também

- [Backend — Arquitetura Detalhada](./backend/arquitetura-estrutura.md)
- [Frontend — Arquitetura Detalhada](./frontend/arquitetura-estrutura.md)
- [IA Analyze — Arquitetura Detalhada](./servicos/ia-analyze/arquitetura-estrutura.md)
- [Banco de Dados — Visão Geral e Arquitetura](./banco-de-dados/visao-geral.md)
- [CI/CD — Workflows e Deploys](./workflows.md)
