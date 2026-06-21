# CI/CD — Workflows e Deploys

> Documentação dos pipelines de integração contínua e deploy da plataforma, baseados em GitHub Actions com hospedagem na Vercel.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Por que foi construído assim](#por-que-foi-construído-assim)
3. [Estratégia de Branches](#estratégia-de-branches)
4. [Workflows](#workflows)
   - [Branch Policy](#branch-policy-enforcement-branch-policyyml)
   - [CI Pipeline](#ci-pipeline-ciyml)
   - [E2E Gate (PR → main)](#e2e-gate)
   - [Deploy Web](#deploy-web-deploy-webyml)
   - [Deploy API Gateway](#deploy-api-gateway-deploy-apiyml)
   - [Deploy IA Analyze](#deploy-ia-analyze-deploy-ia-analyzeyml)
5. [Secrets Necessários](#secrets-necessários)
6. [Fluxo Completo](#fluxo-completo)

---

## Visão Geral

O projeto utiliza GitHub Actions com **deploy totalmente manual e confirmado** na Vercel. Não há deploy automático em nenhuma branch — todos os workflows de deploy exigem disparo manual via `workflow_dispatch` e confirmação explícita digitando `ok`.

O CI automático (lint, typecheck, testes de unidade/integração e build) roda em push e Pull Requests nas branches protegidas, bloqueando merges quando falha. O e2e roda como **gate da promoção para produção** (PR → `main`) contra o ambiente de homologação já deployado.

| Workflow | Arquivo | Trigger | Propósito |
|---|---|---|---|
| Branch Policy Enforcement | `branch-policy.yml` | PR → `main` | Bloqueia merges fora do fluxo `homolog → main` |
| CI Pipeline | `ci.yml` | Push / PR em `homolog` e `main` | Portão de qualidade: lint + typecheck + testes (unidade/integração) + build |
| E2E Gate | `e2e-main.yml` | PR → `main` | Gate de promoção: e2e (Playwright) contra o homolog deployado |
| Deploy Web | `deploy-web.yml` | `workflow_dispatch` manual | Deploy do frontend (`apps/web`) na Vercel |
| Deploy API Gateway | `deploy-api.yml` | `workflow_dispatch` manual | Deploy do backend (`backends/api-gateway`) na Vercel |
| Deploy IA Analyze | `deploy-ia-analyze.yml` | `workflow_dispatch` manual | Deploy do serviço de IA (`services/ia-analyze`) na Vercel |

> **Nota:** apenas os workflows em `.github/workflows/` na raiz são executados pelo GitHub Actions. Os arquivos em `services/ia-analyze/.github/workflows/` (`ci.yml`, `deploy-web.yml`) são legados/inertes e não rodam.

---

## Por que foi construído assim

### O problema central: monorepo com 3 serviços independentes

O projeto é um monorepo com três peças deployáveis separadas — frontend (`apps/web`), API Gateway (`backends/api-gateway`) e serviço de IA (`services/ia-analyze`). Cada uma tem seu próprio projeto na Vercel e seu próprio ciclo de vida. Isso cria um problema clássico de CI/CD: um push no repositório não significa que todos os serviços precisam ser redeploy.

A resposta adotada foi separar completamente CI de CD:

- **CI é automático e universal** — roda para tudo, em toda branch protegida, sem exceção. É o portão de qualidade.
- **CD é manual e granular** — cada serviço é deployado individualmente, apenas quando necessário, por decisão humana explícita.

### Por que o deploy é manual

Num projeto com equipe pequena, **controle supera velocidade**. Deploy automático em `main` significa que qualquer merge — mesmo um ajuste de texto — dispara um ciclo de deploy completo nos três serviços. Além do custo desnecessário, isso retira do time a decisão de *quando* uma mudança chega ao usuário.

O `workflow_dispatch` com confirmação `ok` resolve isso: o merge acontece, o CI valida, mas a exposição para produção é uma decisão deliberada. Em projetos maiores ou com mais maturidade de processo, o caminho natural seria migrar os deploys de produção para automático após o CI passar — mas essa transição faz sentido quando o volume de deploys justifica.

### Por que a confirmação `ok` existe

Evitar cliques acidentais no botão "Run workflow" da interface do GitHub. Sem a confirmação, é fácil disparar um deploy de produção por engano ao testar o painel de Actions. O custo de digitar `ok` é baixo; o custo de um deploy acidental num momento errado pode ser alto.

### Por que a Branch Policy é um workflow e não só uma rule do GitHub

O GitHub permite configurar branch protection rules que exigem status checks para merge. O `branch-policy.yml` é exatamente isso: ele cria um status check que falha se a branch de origem não for `homolog`. Isso automatiza uma regra que, se deixada para o processo manual, seria quebrada eventualmente. Nenhum desenvolvedor consegue abrir um PR de `feature/x` direto para `main` sem que o GitHub bloqueie.

### Pirâmide de testes e por que o e2e gateia a PR → `main`

O CI executa a base e o meio da pirâmide — **testes de unidade e integração (Vitest)** dos três pacotes — em **toda** PR (`homolog` e `main`), em jobs paralelos. São testes herméticos (100% mockados, sem rede nem secrets), então são rápidos e determinísticos: o lugar certo para bloquear cedo.

O topo da pirâmide — **e2e (Playwright)** — precisa de um ambiente real no ar e exercita o login por **cookie cross-domain**. Por isso ele não roda como teste hermético no CI; roda como **gate da PR → `main`** contra o ambiente de **homologação já deployado** (`feedback-analytics-web-homolog.vercel.app`). Faz sentido porque toda PR para `main` vem obrigatoriamente de `homolog` (garantido pela Branch Policy), e o homolog é um alias estável onde a derivação web→api e o cookie `SameSite=None; Secure` já funcionam.

Por que **não** bloquear o deploy de `homolog` com e2e? Porque o frontend tem uma proteção anti-cross-branch (`apps/web/src/lib/utils/http.ts`) que faz uma URL de preview efêmera derivar uma API de hash inexistente e ignorar uma URL de API explícita de outra branch. Resultado: um preview efêmero não consegue autenticar contra a API homolog fixa. Testar contra o homolog já deployado contorna isso sem mexer no código do app. O e2e pós-deploy de `homolog` (no `deploy-web.yml`) continua existindo como verificação do próprio ambiente.

### Como esse fluxo se encaixa no projeto

| Característica do projeto | Como o fluxo responde |
|---|---|
| Monorepo com 3 serviços independentes | Deploys separados por serviço — nenhum redeploy desnecessário |
| Produto em evolução constante | CI estrito evita que código quebrado chegue a `homolog` ou `main` |
| Equipe pequena / solo | Deploy manual tem overhead baixo e dá controle total sobre o momento de cada release |
| Supabase como backend de dados | Banco e Auth não precisam de deploy — só os 3 serviços Node/React |
| Vercel como plataforma | `--local-config` por serviço permite cada pacote ter sua própria configuração de build e rotas |

---

### Vantagens

- **CI nunca pode ser bypassado** — lint, typecheck, testes de unidade/integração e build são obrigatórios em qualquer PR para `homolog` ou `main`; o e2e é obrigatório na promoção para `main`.
- **Pirâmide de testes real** — unidade/integração rodam em paralelo (matriz por pacote) em toda PR; o e2e gateia a promoção para produção contra o homolog.
- **Deploy consciente** — nada vai para produção sem uma ação intencional. Reduz o risco de deploys em horários indesejados.
- **Serviços independentes** — é possível deployar só o frontend sem tocar a API ou o serviço de IA, e vice-versa. Janela de risco menor a cada deploy.
- **Concorrência controlada** — `cancel-in-progress: true` garante que dois deploys simultâneos do mesmo serviço na mesma branch não coexistam, evitando condição de corrida.
- **Promoção de código forçada** — a Branch Policy torna tecnicamente impossível (não apenas proibido por convenção) que código vá direto de uma feature para produção.
- **Cache npm por pacote** — o CI usa `cache-dependency-path` com os quatro `package-lock.json`, então dependências inalteradas são reutilizadas entre runs.

### Desvantagens

- **Produção não é atualizada automaticamente após merge** — se o desenvolvedor esquece de disparar o deploy, a `main` fica com código mais novo que o ambiente de produção silenciosamente. Não há alerta para isso.
- **Sem filtro de paths** — o job de qualidade instala e valida os quatro pacotes mesmo quando só um mudou. Não há filtro de paths no pipeline, o que gasta minutos de Actions em mudanças isoladas. (Os testes de unidade já rodam em matriz paralela por pacote.)
- **Typecheck cobre só produção** — o passo de typecheck usa `tsconfig.ci.json` por pacote, que exclui os arquivos de teste (que têm erros de tipo pré-existentes). Regressões de tipo dentro dos testes não são pegas pelo gate.
- **E2E depende do homolog estar atualizado** — o gate da PR → `main` testa o ambiente de homologação deployado; se o homolog não foi redeployado com o código a ser promovido, o e2e valida uma versão defasada. O processo do time (deploy manual de homolog para validar antes de abrir a PR) mitiga isso.
- **E2E muta dados reais** — os specs usam `service_role` no Supabase compartilhado (seed/cleanup), então rodar o gate concorrentemente pode gerar flakiness.
- **Deploy manual exige acesso ao GitHub Actions** — em times maiores, isso pode ser um gargalo se só parte do time tiver permissão para disparar workflows.
- **Sem rollback automatizado** — não há workflow de rollback documentado. Em caso de deploy com problema, o processo é manual (re-deploy da versão anterior via interface da Vercel).

---

## Estratégia de Branches

O repositório segue um fluxo linear de promoção de código:

```
feature → homolog → main
```

| Branch | Ambiente | Papel |
|---|---|---|
| `feature/*` | Local | Desenvolvimento. Nunca deployada diretamente. |
| `homolog` | Homologação (Vercel Preview) | Recebe merges de features. Deploy manual gera URL de preview para validação. |
| `main` | Produção (Vercel Production) | Só aceita merges vindos de `homolog`, garantido pelo workflow de Branch Policy. |

---

## Workflows

### Branch Policy Enforcement (`branch-policy.yml`)

**Trigger:** `pull_request` com destino `main` (eventos: `opened`, `synchronize`, `reopened`)

**Propósito:** Impede que qualquer branch que não seja `homolog` abra Pull Request para `main`. Garante que todo código passe pela etapa de homologação antes de ir para produção.

**Lógica:**
```bash
if [[ "$GITHUB_HEAD_REF" != "homolog" ]]; then
  exit 1  # PR bloqueado
fi
```

Se o PR vier de qualquer outra branch, o job falha e o merge é bloqueado pelo GitHub.

---

### CI Pipeline (`ci.yml`)

**Trigger:** Push e Pull Requests nas branches `main` e `homolog` — cobre, portanto, **as duas PRs** do fluxo (`feature → homolog` e `homolog → main`).

**Runner:** `ubuntu-latest` | **Node.js:** `20.x`

**Propósito:** Portão de qualidade obrigatório — nenhum merge é permitido se este pipeline falhar. São **dois jobs independentes** que rodam em paralelo.

#### Job `lint-typecheck-build`

| # | Step | Comando |
|---|---|---|
| 1 | Checkout | `actions/checkout@v4` |
| 2 | Setup Node.js 20 com cache npm | `actions/setup-node@v4` |
| 3 | Instalar dependências dos 4 pacotes | `npm ci --prefix {shared, backends/api-gateway, apps/web, services/ia-analyze}` |
| 4 | Linter (3 pacotes) | `npm run lint` |
| 5 | Typecheck (3 pacotes, sem testes) | `tsc -p {apps/web, backends/api-gateway, services/ia-analyze}/tsconfig.ci.json --noEmit` |
| 6 | Build web | `npm run build` |

O typecheck usa um `tsconfig.ci.json` por pacote que **exclui os arquivos de teste** — o código de produção dos três pacotes compila limpo via `tsc --noEmit`. Variáveis injetadas no build do web: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

#### Job `unit-tests` (matriz)

Roda os testes de unidade/integração (Vitest) dos três pacotes em paralelo, via `strategy.matrix` (`fail-fast: false`). São testes 100% mockados — **nenhum secret nem rede é necessário**.

| Pacote | Check (status) | Comando |
|---|---|---|
| `web` | `unit-tests (web)` | `npm run test --prefix apps/web -- run` |
| `api-gateway` | `unit-tests (api-gateway)` | `npm run test --prefix backends/api-gateway` |
| `ia-analyze` | `unit-tests (ia-analyze)` | `npm run test --prefix services/ia-analyze` |

> **Cuidado documentado:** o script `test` do `apps/web` é `vitest` **sem** `run` (modo *watch*, que travaria o CI). Por isso a matriz usa `-- run` para o web, forçando a execução única. `api-gateway` e `ia-analyze` já usam `vitest run`.

**Cache npm:** `cache-dependency-path` aponta para os `package-lock.json` dos pacotes, acelerando execuções subsequentes.

---

### E2E Gate (PR → main) (`e2e-main.yml`) { #e2e-gate }

**Trigger:** `pull_request` com destino `main`.

**Propósito:** Gate de promoção para produção — a PR `homolog → main` só passa se a suíte e2e (Playwright) rodar verde contra o ambiente de **homologação já deployado**.

**Como funciona:**
- Instala dependências (`shared` + `apps/web`) e o Chromium do Playwright.
- Roda `npm run test:e2e` com `PLAYWRIGHT_BASE_URL=https://feedback-analytics-web-homolog.vercel.app`.
- Publica o `playwright-report` como artefato (`playwright-report-main-gate`).
- `concurrency` por número da PR com `cancel-in-progress: true`.

Como a PR para `main` sempre vem de `homolog` (Branch Policy) e o homolog é um alias estável, o e2e exercita o login por cookie cross-domain exatamente como em produção, sem preview efêmero. Ver a subseção **Pirâmide de testes e por que o e2e gateia a PR → `main`** (em [Por que foi construído assim](#por-que-foi-construído-assim)).

**Secrets utilizados:** `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `E2E_TEST_ENTERPRISE_ID`, `VITE_SUPABASE_URL` (mapeado para `SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`.

> **Pré-requisito de branch protection:** para o gate realmente bloquear, marque `e2e-main` como *required status check* na ruleset de `main` — junto de `lint-typecheck-build` e dos três `unit-tests (...)`. Os checks de CI devem ser *required* também na ruleset de `homolog`.

---

### Deploy Web (`deploy-web.yml`)

**Trigger:** `workflow_dispatch` (disparo manual) nas branches `homolog` ou `main`

**Concorrência:** `group: deploy-web-{branch}` com `cancel-in-progress: true` — um novo disparo cancela qualquer deploy em andamento na mesma branch.

**Confirmação obrigatória:** campo `confirm_deploy` deve conter exatamente `ok`. Qualquer outro valor encerra o workflow com erro antes de qualquer operação.

**Validações de entrada:**
- Branch deve ser `homolog` ou `main`
- Confirmação deve ser `ok`

**Dependências instaladas:** `shared` + `apps/web`

**Config Vercel:** `--local-config apps/web/vercel.json`

**Comportamento por branch:**

| Branch | Comando Vercel | Resultado |
|---|---|---|
| `homolog` | `vercel deploy --yes --token ...` | Deploy de preview com alias fixo `feedback-analytics-web-homolog.vercel.app` |
| `main` | `vercel deploy --yes --prod --token ...` | Deploy em produção |

Em `homolog`, após fixar o alias estável o workflow instala o Playwright (`chromium`), roda os testes E2E (`npm run test:e2e`) contra esse alias e publica o `playwright-report` como artefato. Essa é a verificação **pós-deploy do próprio ambiente de homologação** — distinta do gate de e2e da PR → `main` (`e2e-main.yml`), que roda **antes** de promover para produção.

**Secrets utilizados:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_WEB` (deploy) · `E2E_TEST_*`, `VITE_SUPABASE_URL`→`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (e2e pós-deploy homolog)

---

### Deploy API Gateway (`deploy-api.yml`)

**Trigger:** `workflow_dispatch` (disparo manual) nas branches `homolog` ou `main`

**Concorrência:** `group: deploy-api-{branch}` com `cancel-in-progress: true`

**Confirmação obrigatória:** campo `confirm_deploy` deve conter exatamente `ok`.

**Dependências instaladas:** `shared` + `backends/api-gateway`

**Bundle:** antes do deploy, uma etapa de `esbuild` empacota `backends/api-gateway/index.ts` em `backends/api-gateway/_bundle.cjs` (o `src` apontado pelo `vercel.json`).

**Config Vercel:** `--local-config backends/api-gateway/vercel.json`

**Comportamento por branch:**

| Branch | Comando Vercel | Resultado |
|---|---|---|
| `homolog` | `vercel deploy --yes --token ...` | Deploy de preview com alias fixo `feedback-analytics-api-homolog.vercel.app` |
| `main` | `vercel deploy --yes --prod --token ...` | Deploy em produção |

**Secrets utilizados:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_API_GATEWAY`

---

### Deploy IA Analyze (`deploy-ia-analyze.yml`)

**Trigger:** `workflow_dispatch` (disparo manual) nas branches `homolog` ou `main`

**Concorrência:** `group: deploy-ia-analyze-{branch}` com `cancel-in-progress: true`

**Confirmação obrigatória:** campo `confirm_deploy` deve conter exatamente `ok`.

**Dependências instaladas:** `shared` + `services/ia-analyze`

**Config Vercel:** `--local-config services/ia-analyze/vercel.json`

**Comportamento por branch:**

| Branch | Comando Vercel | Resultado |
|---|---|---|
| `homolog` | `vercel deploy --yes --token ...` | Deploy de preview com alias fixo `feedback-analytics-ia-homolog.vercel.app` |
| `main` | `vercel deploy --yes --prod --token ...` | Deploy em produção |

**Secrets utilizados:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_IA_ANALYZE`

---

## Secrets Necessários

Todos os secrets são configurados no repositório GitHub em **Settings → Secrets and variables → Actions**.

| Secret | Usado em | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | CI Pipeline · E2E (como `SUPABASE_URL`) | URL do projeto Supabase (build do web e helpers e2e) |
| `VITE_SUPABASE_ANON_KEY` | CI Pipeline | Chave anon do Supabase para o build do web |
| `SUPABASE_SERVICE_ROLE_KEY` | E2E (homolog pós-deploy e `e2e-main`) | Chave `service_role` para seed/cleanup dos testes e2e |
| `E2E_TEST_EMAIL` | E2E | E-mail da conta de teste usada no login dos specs |
| `E2E_TEST_PASSWORD` | E2E | Senha da conta de teste |
| `E2E_TEST_ENTERPRISE_ID` | E2E | ID da empresa de teste usada nos specs |
| `VERCEL_TOKEN` | Todos os deploys | Token de autenticação da Vercel CLI |
| `VERCEL_ORG_ID` | Todos os deploys | ID da organização na Vercel |
| `VERCEL_PROJECT_ID_WEB` | Deploy Web | ID do projeto `apps/web` na Vercel |
| `VERCEL_PROJECT_ID_API_GATEWAY` | Deploy API Gateway | ID do projeto `backends/api-gateway` na Vercel |
| `VERCEL_PROJECT_ID_IA_ANALYZE` | Deploy IA Analyze | ID do projeto `services/ia-analyze` na Vercel |

---

## Fluxo Completo

| Etapa | Branch | O que acontece |
|---|---|---|
| 1 | `feature/*` | Desenvolvimento local |
| 2 | PR → `homolog` | CI roda automaticamente: lint + typecheck + testes (unidade/integração) + build. Merge bloqueado se falhar. |
| 3 | `homolog` (pós-merge) | CI roda novamente no push |
| 4 | `homolog` (validação) | Deploy manual via `workflow_dispatch` com confirmação `ok` → gera URLs de preview na Vercel; e2e pós-deploy valida o ambiente |
| 5 | PR → `main` | Branch Policy bloqueia se não vier de `homolog`. CI roda novamente **e** o `e2e-main` roda a suíte e2e contra o homolog — merge bloqueado se falhar. |
| 6 | `main` (pós-merge) | CI roda no push |
| 7 | `main` (produção) | Deploy manual via `workflow_dispatch` com confirmação `ok` → deploy `--prod` na Vercel para cada serviço alterado |

> **Cada serviço é deployado independentemente.** Em um monorepo, isso evita redeploy desnecessário: é possível deployar somente o frontend sem tocar o API Gateway ou o serviço de IA.
