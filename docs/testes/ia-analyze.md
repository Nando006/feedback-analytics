# Testes — IA Analyze (`services/ia-analyze`)

Este documento detalha a arquitetura, a estrutura e a especificação dos testes automatizados do serviço Serverless **IA Analyze**. O serviço é responsável por se conectar aos modelos de linguagem da Google (Gemini API) para extrair sentimentos estruturados, palavras-chave de feedback e recomendações automáticas para os gestores.

---

## Status da Cobertura

Os testes do serviço IA utilizam o **Vitest** como motor de execução e o **Supertest** para validar os endpoints locais simulando chamadas HTTP internas vindas da API Gateway. A comunicação externa com as APIs do Gemini é mockada em tempo de teste para evitar latência e custos de infraestrutura.

> **Total geral de testes do IA Analyze: 33 testes distribuídos em 4 arquivos**

---

## Como Executar os Testes

Para executar a suíte de testes do serviço de IA a partir da raiz do projeto:

```bash
powershell -ExecutionPolicy Bypass -Command "npm run test:api"
```

Ou diretamente no diretório do serviço:

```bash
cd services/ia-analyze
powershell -ExecutionPolicy Bypass -Command "npx vitest run"
```

---

## Testes Automatizados

Abaixo está o detalhamento sistemático de cada arquivo de teste presente no serviço, especificando sua finalidade e a quantidade de asserções executadas.

| Arquivo de Teste | Propósito Técnico | Qtd. Testes |
| :--- | :--- | :---: |
| [termProcessing.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/services/ia-analyze/src/tests/lib/termProcessing.test.ts) | **Sanitização e Processamento de Termos:** Valida exaustivamente os algoritmos que limpam e qualificam os termos e tags sugeridos pela IA. Cobre funções como `normalizeForComparison` (remoção de acentos/pontuações e colapso de espaços), `isGroundedInMessage` (garantia de que as palavras extraídas existem no comentário real para prevenir alucinações), `sanitizeTermList` (limpeza de duplicatas e limites de contagem) e `buildForbiddenTerms` (geração de blacklist contendo termos estruturados). | **14** |
| [sentiment.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/services/ia-analyze/src/tests/services/sentiment.test.ts) | **Validação de Sentimento e Integridade de Dados:** Garante que a classificação qualitativa atende ao padrão esperado pelo banco (`positive`, `neutral`, `negative`). Valida se o ID de feedback fornecido é válido, rejeita tipos incompatíveis e impede o processamento de registros cujos identificadores não estejam no mapa de cache. | **9** |
| [analyze.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/services/ia-analyze/src/tests/routes/analyze.test.ts) | **Endpoint de Análise de Lotes (/analyze):** Testa a rota principal do serviço (`POST /internal/ia-analyze/analyze`). Cobre a segurança de cabeçalhos por token de autenticação interna, validações Zod do payload, processamento bem-sucedido com chamadas mockadas à IA do Gemini, resposta a lotes sem feedback e o repasse correto de erros da API do Gemini (status 502) ou erros inesperados (status 500). | **8** |
| [health.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/services/ia-analyze/src/tests/routes/health.test.ts) | **Verificação de Integridade (Healthcheck):** Valida as rotas de checagem do serviço (`GET /internal/health` e `GET /internal/ia-analyze/health`), garantindo que o servidor Express responda status 200 com `{ ok: true, service: "ia-analyze" }`. | **2** |

---

## Estrutura de Mocks

Para evitar dependências de rede externas durante os testes automatizados, o motor Gemini é mockado no controlador de rotas:

* **Mock do Orquestrador (`iaAnalyze.service.js`):** O módulo orquestrador de IA é interceptado via `vi.mock('../../services/iaAnalyze.service.js')` para substituir o método `runIaAnalyzeService` por um resolvedor simulado. Isso permite testar todos os cenários de sucesso, erro de infraestrutura (`IaAnalyzeServiceError`) ou falha inesperada na chamada da API da Google sem enviar requisições reais à internet.

---

## Veja Também

* [Plano Estratégico de Testes](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/plano-estrategico.md)
* [Visão Geral dos Testes](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/visao-geral.md)
* [Testes da Aplicação Web (Frontend)](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/web.md)
* [Testes do API Gateway (Backend)](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/api-gateway.md)
