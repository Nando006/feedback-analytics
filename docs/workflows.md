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
   - [Deploy Web](#deploy-web-deploy-webyml)
   - [Deploy API Gateway](#deploy-api-gateway-deploy-apiyml)
   - [Deploy IA Analyze](#deploy-ia-analyze-deploy-ia-analyzeyml)
5. [Secrets Necessários](#secrets-necessários)
6. [Fluxo Completo](#fluxo-completo)

---

## Visão Geral

O projeto utiliza GitHub Actions com **deploy totalmente manual e confirmado** na Vercel. Não há deploy automático em nenhuma branch — todos os workflows de deploy exigem disparo manual via `workflow_dispatch` e confirmação explícita digitando `ok`.

O CI automático (lint, testes, build) roda em push e Pull Requests nas branches protegidas, bloqueando merges quando falha.

| Workflow | Arquivo | Trigger | Propósito |
|---|---|---|---|
| Branch Policy Enforcement | `branch-policy.yml` | PR → `main` | Bloqueia merges fora do fluxo `homolog → main` |
| CI Pipeline | `ci.yml` | Push / PR em `homolog` e `main` | Portão de qualidade: lint + testes + build |
| Deploy Web | `deploy-web.yml` | `workflow_dispatch` manual | Deploy do frontend (`apps/web`) na Vercel |
| Deploy API Gateway | `deploy-api.yml` | `workflow_dispatch` manual | Deploy do backend (`backends/api-gateway`) na Vercel |
| Deploy IA Analyze | `deploy-ia-analyze.yml` | `workflow_dispatch` manual | Deploy do serviço de IA (`services/ia-analyze`) na Vercel |

---

## Por que foi construído assim

### O problema central: monorepo com 3 serviços independentes

O projeto é um monorepo com três peças deployáveis separadas — frontend (`apps/web`), API Gateway (`backends/api-gateway`) e serviço de IA (`services/ia-analyze`). Cada uma tem seu próprio projeto na Vercel e seu próprio ciclo de vida. Isso cria um problema clássico de CI/CD: um push no repositório não significa que todos os serviços precisam ser redeploy.

A resposta adotada foi separar completamente CI de CD:

- **CI é automático e universal** — roda para tudo, em toda branch protegida, sem exceção. É o portão de qualidade.
- **CD é manual e granular** — cada serviço é deployado individualmente, apenas quando necessário, por decisão humana explícita.

### Por que o deploy é manual

Num projeto em estágio de MVP com equipe pequena, **controle supera velocidade**. Deploy automático em `main` significa que qualquer merge — mesmo um ajuste de texto — dispara um ciclo de deploy completo nos três serviços. Além do custo desnecessário, isso retira do time a decisão de *quando* uma mudança chega ao usuário.

O `workflow_dispatch` com confirmação `ok` resolve isso: o merge acontece, o CI valida, mas a exposição para produção é uma decisão deliberada. Em projetos maiores ou com mais maturidade de processo, o caminho natural seria migrar os deploys de produção para automático após o CI passar — mas essa transição faz sentido quando o volume de deploys justifica.

### Por que a confirmação `ok` existe

Evitar cliques acidentais no botão "Run workflow" da interface do GitHub. Sem a confirmação, é fácil disparar um deploy de produção por engano ao testar o painel de Actions. O custo de digitar `ok` é baixo; o custo de um deploy acidental num momento errado pode ser alto.

### Por que a Branch Policy é um workflow e não só uma rule do GitHub

O GitHub permite configurar branch protection rules que exigem status checks para merge. O `branch-policy.yml` é exatamente isso: ele cria um status check que falha se a branch de origem não for `homolog`. Isso automatiza uma regra que, se deixada para o processo manual, seria quebrada eventualmente. Nenhum desenvolvedor consegue abrir um PR de `feature/x` direto para `main` sem que o GitHub bloqueie.

### Como esse fluxo se encaixa no projeto

| Característica do projeto | Como o fluxo responde |
|---|---|
| Monorepo com 3 serviços independentes | Deploys separados por serviço — nenhum redeploy desnecessário |
| MVP em evolução constante | CI estrito evita que código quebrado chegue a `homolog` ou `main` |
| Equipe pequena / solo | Deploy manual tem overhead baixo e dá controle total sobre o momento de cada release |
| Supabase como backend de dados | Banco e Auth não precisam de deploy — só os 3 serviços Node/React |
| Vercel como plataforma | `--local-config` por serviço permite cada pacote ter sua própria configuração de build e rotas |

---

### Vantagens

- **CI nunca pode ser bypassado** — lint, testes e build são obrigatórios em qualquer PR para `homolog` ou `main`.
- **Deploy consciente** — nada vai para produção sem uma ação intencional. Elimina surpresas em horários indesejados.
- **Serviços independentes** — é possível deployar só o frontend sem tocar a API ou o serviço de IA, e vice-versa. Janela de risco menor a cada deploy.
- **Concorrência controlada** — `cancel-in-progress: true` garante que dois deploys simultâneos do mesmo serviço na mesma branch não coexistam, evitando condição de corrida.
- **Promoção de código forçada** — a Branch Policy torna tecnicamente impossível (não apenas proibido por convenção) que código vá direto de uma feature para produção.
- **Cache npm por pacote** — o CI usa `cache-dependency-path` com os quatro `package-lock.json`, então dependências inalteradas são reutilizadas entre runs.

### Desvantagens

- **Produção não é atualizada automaticamente após merge** — se o desenvolvedor esquece de disparar o deploy, a `main` fica com código mais novo que o ambiente de produção silenciosamente. Não há alerta para isso.
- **CI sem paralelismo** — lint, testes e build rodam em sequência num único job. Num monorepo maior, isso aumentaria o tempo de feedback significativamente. O caminho seria separar em jobs paralelos por pacote.
- **Todos os pacotes são instalados e buildados em todo CI** — mesmo que só o frontend tenha mudado, o CI instala e executa tudo. Não há filtro de paths no pipeline, o que é um desperdício de minutos de Actions em mudanças isoladas.
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

**Trigger:** Push e Pull Requests nas branches `main` e `homolog`

**Runner:** `ubuntu-latest` | **Node.js:** `20.x`

**Propósito:** Portão de qualidade obrigatório — nenhum merge é permitido se este pipeline falhar.

| # | Step | Comando |
|---|---|---|
| 1 | Checkout | `actions/checkout@v4` |
| 2 | Setup Node.js 20 com cache npm | `actions/setup-node@v4` |
| 3 | Instalar dependências do `shared` | `npm ci --prefix shared` |
| 4 | Instalar dependências do `api-gateway` | `npm ci --prefix backends/api-gateway` |
| 5 | Instalar dependências do `web` | `npm ci --prefix apps/web` |
| 6 | Instalar dependências do `ia-analyze` | `npm ci --prefix services/ia-analyze` |
| 7 | Linter | `npm run lint` |
| 8 | Build completo | `npm run build` |

**Cache npm:** configurado com `cache-dependency-path` apontando para os `package-lock.json` dos 4 pacotes do monorepo, acelerando execuções subsequentes.

**Variáveis de ambiente injetadas no build (via Secrets):**

| Secret | Variável injetada |
|---|---|
| `VITE_SUPABASE_URL` | `VITE_SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | `VITE_SUPABASE_ANON_KEY` |

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
| `homolog` | `vercel deploy --yes --token ...` | URL de preview dinâmica |
| `main` | `vercel deploy --yes --prod --token ...` | Deploy em produção |

**Secrets utilizados:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_WEB`

---

### Deploy API Gateway (`deploy-api.yml`)

**Trigger:** `workflow_dispatch` (disparo manual) nas branches `homolog` ou `main`

**Concorrência:** `group: deploy-api-{branch}` com `cancel-in-progress: true`

**Confirmação obrigatória:** campo `confirm_deploy` deve conter exatamente `ok`.

**Dependências instaladas:** `shared` + `backends/api-gateway`

**Config Vercel:** `--local-config backends/api-gateway/vercel.json`

**Comportamento por branch:**

| Branch | Comando Vercel | Resultado |
|---|---|---|
| `homolog` | `vercel deploy --yes --token ...` | URL de preview dinâmica |
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
| `homolog` | `vercel deploy --yes --token ...` | URL de preview dinâmica |
| `main` | `vercel deploy --yes --prod --token ...` | Deploy em produção |

**Secrets utilizados:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_IA_ANALYZE`

---

## Secrets Necessários

Todos os secrets são configurados no repositório GitHub em **Settings → Secrets and variables → Actions**.

| Secret | Usado em | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | CI Pipeline | URL do projeto Supabase para os testes |
| `VITE_SUPABASE_ANON_KEY` | CI Pipeline | Chave anon do Supabase para os testes |
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
| 2 | PR → `homolog` | CI roda automaticamente. Merge bloqueado se falhar. |
| 3 | `homolog` (pós-merge) | CI roda novamente no push |
| 4 | `homolog` (validação) | Deploy manual via `workflow_dispatch` com confirmação `ok` → gera URLs de preview na Vercel para cada serviço |
| 5 | PR → `main` | Branch Policy bloqueia se não vier de `homolog`. CI roda novamente. |
| 6 | `main` (pós-merge) | CI roda no push |
| 7 | `main` (produção) | Deploy manual via `workflow_dispatch` com confirmação `ok` → deploy `--prod` na Vercel para cada serviço alterado |

> **Cada serviço é deployado independentemente.** Em um monorepo, isso evita redeploy desnecessário: é possível deployar somente o frontend sem tocar o API Gateway ou o serviço de IA.
