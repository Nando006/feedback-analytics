# Testes — Backend (`backends/api-gateway`)

## Status Atual

**Sem cobertura.** O API Gateway não tem nenhum arquivo de teste.

Isso representa o maior risco de regressão do projeto — o gateway é o ponto de entrada de todas as requisições, concentra autenticação, lógica de negócio, acesso ao banco via Prisma e comunicação com o serviço IA.

---

## O Que Não Está Sendo Testado

| Área | Risco |
|---|---|
| Middlewares de autenticação (JWT) | Um bug silencia o sistema ou abre acesso indevido |
| Endpoints de feedback (`/api/feedback/*`) | Regressão em regras de negócio só aparece em produção |
| Integração com Prisma / banco de dados | Queries quebradas não são detectadas antes do deploy |
| Chamada ao serviço `ia-analyze` | Falha de contrato (payload errado) não é percebida |
| Validações de entrada (Zod) | Dados inválidos podem alcançar o banco |
| Anti-spam e fingerprint | Lógica de bloqueio pode ser quebrada silenciosamente |

---

## Como Cobrir

### Testes de Integração com Supertest

A abordagem recomendada é usar **Supertest** apontando diretamente para o Express app, com banco de dados de teste isolado (PostgreSQL em container).

```bash
npm install -D supertest @types/supertest vitest
```

Exemplo de estrutura:

```
backends/api-gateway/
└── src/
    └── __tests__/
        ├── auth.test.ts          ← login, token, refresh
        ├── feedback.test.ts      ← envio e listagem de feedbacks
        ├── enterprise.test.ts    ← configurações da empresa
        └── setup.ts              ← conexão com banco de teste
```

Exemplo de teste:

```ts
import request from 'supertest';
import { app } from '../app';

describe('POST /api/auth/login', () => {
  it('retorna token com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'senha123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejeita credenciais inválidas com 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'errado' });

    expect(res.status).toBe(401);
  });
});
```

---

## Endpoints Prioritários

Se a cobertura for implementada em etapas, esta é a ordem de prioridade:

| Prioridade | Endpoint | Motivo |
|---|---|---|
| 1 | `POST /api/auth/login` | Porta de entrada do sistema |
| 2 | `POST /api/feedback/qr` | Endpoint público de alto volume |
| 3 | `GET /api/dashboard/*` | Queries de agregação — risco de regressão em performance |
| 4 | `POST /internal/ia-analyze/*` | Contrato com o microserviço IA |
| 5 | `PUT /api/enterprise/*` | Configurações críticas da empresa |

---

## Veja Também

- [Visão Geral dos Testes](./visao-geral.md)
- [Frontend](./web.md)
- [Microserviço IA](./ia-analyze.md)
- [Visão Geral do Backend](../backend/visao-geral.md)
