# Runbook de Cutover Vercel por Dominio

## Objetivo

Finalizar a separacao de deploy por dominio no monorepo e remover o arquivo vercel.json da raiz sem quebrar checks de PR.

Para contexto arquitetural e estrategia geral, consulte docs/deploy/vercel-overview.md.

## Escopo

- Web: apps/web
- API Gateway: backends/api-gateway
- IA Analyze: services/ia-analyze

## Pre-condicoes tecnicas

1. Frontend sem chamadas diretas para /api fora da camada HTTP central.
2. Gateway com CORS e cookies preparados para cross-site.
3. Pipelines de deploy por dominio funcionando no GitHub Actions.

## Estrategia para plano gratuito

1. Deploy automatico somente em main (producao).
2. Deploy de homolog apenas manual via workflow_dispatch.
3. Evitar esteira dupla: usar GitHub Actions como unica fonte de deploy.

## Passo 1 - Reconfigurar projetos na Vercel

1. Projeto feedback-analytics-web:
- Root Directory: . (raiz do repositorio)
- Build Command: npm run build
- Output Directory: dist
- Framework Preset: Vite

2. Projeto feedback-analytics-api:
- Root Directory: . (raiz do repositorio)
- Framework Preset: Other
- Install Command: npm ci --prefix shared && npm ci --prefix backends/api-gateway

3. Projeto feedback-analytics-service-ia-analysis:
- Root Directory: . (raiz do repositorio)
- Framework Preset: Other
- Install Command: npm ci --prefix shared && npm ci --prefix services/ia-analyze

5. Validar vercel.json por dominio com caminhos relativos a raiz do repositorio:
- Web (apps/web/vercel.json): src deve ser apps/web/package.json
- API (backends/api-gateway/vercel.json): src deve ser backends/api-gateway/index.ts
- IA (services/ia-analyze/vercel.json): src deve ser services/ia-analyze/src/index.ts

4. Variaveis de ambiente por projeto:
- Web: VITE_API_BASE_URL apontando para o dominio da API Gateway
- API: PUBLIC_SITE_URL, CORS_ALLOWED_ORIGINS, COOKIE_CROSS_SITE, IA_ANALYZE_REMOTE_*
- IA Analyze: IA_ANALYZE_INTERNAL_TOKEN e GEMINI_API_KEY

## Passo 2 - Desvincular ou desativar o projeto raiz

1. Abrir o projeto raiz feedback-analytics na Vercel.
2. Em Settings > Git:
- Desconectar o repositorio, ou
- Desativar Automatic Deployments para Preview e Production.
3. Garantir que os checks de Vercel no PR fiquem somente para:
- feedback-analytics-web
- feedback-analytics-api
- feedback-analytics-service-ia-analysis

4. Em cada projeto de dominio (web/api/ia), em Settings > Git:
- Desativar Automatic Deployments de Preview e Production quando o deploy oficial for via GitHub Actions.
- Manter somente deploy via CLI/token do workflow para evitar esteira dupla e consumo duplicado de quota.

## Passo 3 - Padronizar frontend para cliente HTTP central

1. Validar regra de lint que bloqueia fetch direto para /api.
2. Validar que todas as chamadas passam por src/lib/utils/http.
3. Manter VITE_API_BASE_URL configurado por ambiente.

## Passo 4 - Ajustar CORS e cookies cross-site no gateway

1. Definir PUBLIC_SITE_URL com o dominio publico do frontend.
2. Definir CORS_ALLOWED_ORIGINS com todas as origens permitidas separadas por virgula.
3. Definir COOKIE_CROSS_SITE=true em producao quando web e api estiverem em dominios diferentes.
4. Manter NODE_ENV=production para garantir cookie secure.

## Validacao de cutover

1. Login e logout com cookie funcionando no dominio web.
2. Cadastro publico funcionando via dominio da API.
3. Chamada protegida retornando 200 com credentials include.
4. Preflight OPTIONS retornando 204 para origens permitidas.
5. Preflight OPTIONS retornando 403 para origem nao permitida.
6. Endpoint de IA funcionando com token interno quando modo remoto estiver ativo.

## Troubleshooting rapido

1. Dominio *.vercel.app retornando 404 NOT_FOUND:
- Em branch homolog, deploy padrao e Preview; use a URL de Preview do check/Action.
- O dominio principal do projeto responde o deploy de Production (main ou --prod).

2. Deploy com status completed, mas pagina 404:
- Verificar se o vercel.json do dominio usa caminhos com prefixo de dominio partindo da raiz.
- Verificar se o projeto correto esta conectado ao repositorio em Settings > Git.

3. Checks da Vercel no PR aparecem, mas URLs nao abrem:
- Confirmar se o projeto nao foi desconectado do Git por engano.
- Reexecutar um novo deploy de preview apos ajustar Root Directory/vercel.json.

4. Rollup falha para resolver import "zod" em shared/schemas:
- Garantir alias de zod no Vite apontando para node_modules do web.
- Validar build local do web antes de novo deploy.

## Remocao final do arquivo da raiz

1. Remover vercel.json da raiz.
2. Atualizar README para remover observacao de compatibilidade da raiz.
3. Abrir PR e validar checks.

## Rollback rapido

1. Restaurar vercel.json na raiz.
2. Reativar projeto raiz da Vercel se necessario.
3. Reexecutar deploy por dominio apos correcao de configuracao.
