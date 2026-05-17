# Testes — Visão Geral

## Cobertura por Domínio

| Domínio | Pasta | Arquivos de teste | Status |
|---|---|---|---|
| **Frontend** | `apps/web` | 23 | Coberto (unitários + componentes + actions) |
| **Microserviço IA** | `services/ia-analyze` | 0 | Sem cobertura |
| **Backend** | `backends/api-gateway` | 0 | Sem cobertura |

---

## Como Rodar

```bash
# Frontend (apps/web) — modo watch
npm test --workspace=apps/web

# Frontend — execução única (CI)
npm test --workspace=apps/web -- --run
```

---

## Documentação por Domínio

- [Plano de Teste Estratégico](./plano-estrategico.md)
- [Frontend — `apps/web`](./web.md)
- [Microserviço IA — `services/ia-analyze`](./ia-analyze.md)
- [Backend — `backends/api-gateway`](./api-gateway.md)
