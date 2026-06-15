# Testes — Backend (`backends/api-gateway`)

Este documento detalha a arquitetura, a estrutura e a especificação dos testes automatizados do serviço **API Gateway**. Os testes cobrem as rotas, os controladores (*controllers*), as validações de esquema (*Zod schemas*) e a integração com serviços adjacentes, isolando o banco de dados e as chamadas externas por meio de mocks.

---

## Status da Cobertura

Os testes do API Gateway utilizam o **Vitest** como motor de testes e o **Supertest** para simular requisições HTTP reais diretamente contra a aplicação Express. O banco de dados Supabase é completamente mockado em memória nas fixtures de teste para garantir a velocidade e a repetibilidade das asserções.

> **Total geral de testes do API Gateway: 37 testes distribuídos em 5 arquivos**

---

## Como Executar os Testes

Para executar os testes do API Gateway a partir da raiz do projeto:

```bash
powershell -ExecutionPolicy Bypass -Command "npm run test:api"
```

Ou diretamente no diretório do serviço:

```bash
cd backends/api-gateway
powershell -ExecutionPolicy Bypass -Command "npx vitest run"
```

---

## Testes Automatizados

Abaixo está o detalhamento sistemático de cada arquivo de teste presente no serviço, especificando sua finalidade técnica e o volume de asserções executadas.

| Arquivo de Teste | Propósito Técnico | Qtd. Testes |
| :--- | :--- | :---: |
| [auth.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/backends/api-gateway/src/tests/auth.test.ts) | **Fluxo de Autenticação e Gestão de Contas:** Valida os endpoints de Login (`/login`), Registro de Conta (`/register`), Recuperação de Senha (`/recover-password`) e Logout (`/logout`). Garante regras como bloqueio de payloads inválidos por Zod, erro de CPFs inválidos, recusa de senhas divergentes, tratamento de e-mails não verificados e a política de **privacidade anti-enumeração** (retornando status 200 de sucesso quando o e-mail inserido já estiver cadastrado). | **15** |
| [feedbacks.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/backends/api-gateway/src/tests/feedbacks.test.ts) | **Histórico e Estatísticas de Feedbacks:** Testa a consulta protegida de feedbacks (`GET /api/protected/feedbacks`) e a agregação de dados para os cards do dashboard (`GET /api/protected/feedbacks/stats`). Valida a paginação padrão, proteção contra requisições anônimas (retorna 401), filtros de busca por categoria do catálogo/nota e tratamento de empresas não existentes. | **7** |
| [ia-analyze.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/backends/api-gateway/src/tests/ia-analyze.test.ts) | **Integração com Serviço Serverless de IA:** Valida as pontes de comunicação com a IA (`/analyze-raw` e `/regenerate`). Garante o tratamento correto de erros específicos do motor de IA (`IaAnalyzeServiceError` retornando códigos de erro tipados ao frontend), falhas genéricas de conexão HTTP (retornando status 500) e restrição de tokens de acesso JWT. | **6** |
| [qrcode-feedback.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/backends/api-gateway/src/tests/qrcode-feedback.test.ts) | **Coleta de Feedback via QR Code Público:** Valida a ingestão pública de dados de feedbacks via QR Code (`POST /api/public/feedback`) e a leitura dos metadados da empresa (`GET /api/public/feedback/enterprise/:id`). Cobre regras como bloqueio contra múltiplos envios diários de um mesmo dispositivo (*fingerprint anti-spam*), validações de campos obrigatórios e tratamento de ID empresarial inválido. | **8** |
| [health.test.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/backends/api-gateway/src/tests/health.test.ts) | **Verificação de Integridade (Liveness/Readiness):** Valida a resposta do endpoint de healthcheck (`GET /api/health`), garantindo que o gateway responda com sucesso e status `{ ok: true }`. | **1** |

---

## Estrutura de Mocks

Para manter os testes unitários isolados de redes externas ou do banco Supabase real, é configurado um mock global para o Supabase no arquivo de fixture:

* **[supabase-mock.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/backends/api-gateway/src/tests/helpers/supabase-mock.ts):** Mocka as funções do cliente `createSupabaseServerClient`, interceptando chamadas de autenticação e persistência (como chamadas a `auth.signUp`, `auth.signInWithPassword`, `from().select()`, `from().insert()`, etc.) e retornando dados estáticos previsíveis definidos para teste.

---

## Veja Também

* [Plano Estratégico de Testes](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/plano-estrategico.md)
* [Visão Geral dos Testes](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/visao-geral.md)
* [Testes da Aplicação Web (Frontend)](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/web.md)
* [Testes do Serviço de IA](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/ia-analyze.md)
