# Testes — Visão Geral

## Cobertura por Domínio

| Domínio | Pasta | Arquivos de teste | Status |
|---|---|---|---|
| **Frontend** | `apps/web` | 22 | Coberto (unitários + componentes + actions) |
| **IA Analyze** | `services/ia-analyze` | 4 | Coberto (unitários + integração de rotas) |
| **Backend (API Gateway)** | `backends/api-gateway` | 5 | Coberto (unitários + integração com banco mockado) |
| **Testes E2E (Playwright)** | `apps/web/e2e` | 11 | Coberto (fluxos completos do sistema) |


---

## Pirâmide de Testes Global

O projeto adota uma estratégia de testes distribuída em múltiplas camadas que cobrem o frontend, a API Gateway, o serviço Serverless de IA e a integração geral do ecossistema.

```
           ╔═════════════════════╗
           ║     E2E (28)        ║  ← Playwright: Jornada real integrada (front + back + Supabase real)
           ╚═════════════════════╝
        ╔═══════════════════════════╗
        ║     Integração (63)       ║  ← Express (35 api-gateway + 10 ia-analyze) e Actions/Loaders (18 frontend)
        ╚═══════════════════════════╝
     ╔═════════════════════════════════╗
     ║        Unidade (127)            ║  ← Regras puras (104 frontend + 23 ia-analyze) e componentes isolados
     ╚═════════════════════════════════╝
```

* **Testes de Unidade (127 testes):** Validam a menor unidade lógica de forma isolada e rápida. Incluem 104 testes unitários e de componentes no [Frontend](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/web.md) e 23 testes utilitários de termos e sentimentos no [Serviço de IA](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/ia-analyze.md).
* **Testes de Integração (63 testes):** Validam o contrato e o fluxo de dados cruzando fronteiras de múltiplos módulos. Incluem 18 testes de Actions e Loaders do React Router no [Frontend](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/web.md), 35 testes de controllers e rotas no [API Gateway](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/api-gateway.md) e 10 testes de rotas no [Serviço de IA](file:///C:/Users/Fernando/Repositorios/feedback-analytics/docs/testes/ia-analyze.md).
* **Testes E2E (28 testes):** Validam cenários de negócio ponta a ponta em navegador Chrome real (via Playwright) cobrindo as jornadas dos 12 Casos de Uso integrados.

---

## Como Rodar

Os testes podem ser executados a partir da raiz do projeto através dos comandos abaixo:

```bash
# Rodar testes de unidade e componentes do Frontend
npm run test:web

# Rodar testes unitários/integração do Backend (API Gateway)
npm run test:api

# Rodar testes unitários/integração do IA Analyze
npm run test:ia

# Rodar testes E2E do Playwright (Navegador Headless)
npm run test:e2e

# Rodar testes E2E do Playwright com interface visual (UI mode)
npm run test:e2e:ui
```

---

## Documentação por Domínio

- [Plano de Teste Estratégico](./plano-estrategico.md)
- [Frontend — `apps/web`](./web.md)
- [IA Analyze — `services/ia-analyze`](./ia-analyze.md)
- [Backend — `backends/api-gateway`](./api-gateway.md)
