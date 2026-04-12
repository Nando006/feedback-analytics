# Vercel no Feedback Analytics

## Topicos

1. Por que usar Vercel neste projeto
2. Estrategia de deploy por dominio
3. Fluxo do processo de deploy
4. Operacao no plano gratuito

## Por que a Vercel para nosso projeto

A Vercel encaixa no desenho atual do monorepo porque combina dois modelos que o projeto usa ao mesmo tempo:

1. Frontend Web com build estatico distribuido por CDN.
2. API Gateway e IA Analyze em funcoes Node serverless.
3. Deploy separado por dominio, com isolamento de falhas e escala independente.

Beneficios praticos para o projeto:

1. Escala horizontal na camada de aplicacao (web/api/ia).
2. Menor acoplamento entre dominios.
3. Deploy simples por servico sem precisar manter servidor dedicado.

## Estrategia de deploy dos dominios

Cada dominio possui configuracao propria:

1. Web: apps/web/vercel.json
2. API Gateway: backends/api-gateway/vercel.json
3. IA Analyze: services/ia-analyze/vercel.json

Padrao adotado:

1. Um projeto Vercel por dominio.
2. Um workflow GitHub Actions por dominio.
3. Configuracao local por dominio com --local-config.

## Fluxo do processo de deploy

### Producao (main)

1. Push em main dispara workflows por dominio.
2. Cada workflow instala dependencias do shared e do dominio alvo.
3. O workflow executa deploy com Vercel CLI usando o vercel.json do dominio.
4. O deploy de producao usa a flag --prod.

### Homolog (manual)

1. O deploy de homolog e manual via workflow_dispatch.
2. O time dispara apenas o dominio que precisa validar.
3. O deploy gera preview sem consumir deploy automatico a cada push.

### Selecao por alteracao de arquivos

1. Workflows usam filtros de paths para evitar deploy desnecessario.
2. Alteracao em um dominio nao dispara deploy dos outros dominios.

## Operacao no plano gratuito

Para economizar limite diario de deploy:

1. Manter somente uma esteira de deploy (GitHub Actions).
2. Evitar deploy automatico em homolog.
3. Disparar homolog manualmente apenas quando necessario.
4. Concentrar deploy automatico em main.

Esse modelo reduz consumo de quota e mantem rastreabilidade por workflow.
