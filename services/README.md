# Servicos Externos por Dominio

Camada de integracao especializada para provedores externos, desacoplada do API Gateway e alinhada ao modelo multidominio do monorepo.

## Arquitetura de Servicos Externos com 4 camadas

1. Endpoints Internos: expoem rotas internas para o API Gateway (health e operacoes).
2. Seguranca e Politicas: validam autenticacao interna, rate limit e origem das chamadas.
3. Orquestracao e Adaptadores: aplicam regra de integracao por provedor e transformam payloads.
4. Contratos e Respostas Tipadas: padronizam payloads, erros e respostas para consumo previsivel do BFF.

## Estrategia de dominios para servicos externos

1. Dominio Compartilhado (baixo impacto): agrupa integracoes pequenas no mesmo servidor e no mesmo dominio para reduzir custo operacional.
2. Dominio Dedicado (alto impacto): cada integracao critica opera em servidor e dominio proprios para isolamento, escala e resiliencia.
3. Exemplo no repositorio: services/ia-analyze segue modelo de dominio dedicado por impacto no produto.

## Responsabilidades dos Servicos Externos#

1. Receber chamadas internas do API Gateway com contrato estavel.
2. Encapsular detalhes de APIs terceiras sem vazar complexidade para o frontend.
3. Aplicar resiliencia de integracao (timeouts, retries, fallback e idempotencia quando necessario).
4. Retornar respostas tipadas e consistentes para simplificar orquestracao no BFF.
5. Publicar observabilidade por dominio (logs, metricas e health checks).

## Fluxo de chamada entre BFF e Servicos Externos

1. Frontend chama endpoint do API Gateway.
2. API Gateway valida autenticacao, autorizacao e contexto.
3. Controller decide se a demanda vai para dominio compartilhado (baixo impacto) ou dominio dedicado (alto impacto).
4. Servico externo executa a integracao com provedor terceiro e normaliza a resposta.
5. Servico externo retorna contrato tipado ao API Gateway.
6. API Gateway consolida a resposta final e devolve ao frontend.

## Resumo arquitetural

Os servicos externos seguem um padrao unico de 4 camadas, com duas estrategias de hospedagem: dominio compartilhado para integracoes leves e dominios dedicados para integracoes criticas. Com isso, o monorepo mantem simplicidade operacional sem abrir mao de isolamento e escalabilidade quando o impacto do servico aumenta.
