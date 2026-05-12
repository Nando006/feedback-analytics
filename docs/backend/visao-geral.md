# Backend — Visão Geral (API Gateway)

## O Que É

O `api-gateway` é o **Backend-for-Frontend (BFF)** do sistema. Ele é o único ponto de entrada do backend — o frontend nunca acessa o banco de dados ou o serviço de IA diretamente.

## Por Que Existe

Centralizar o backend em um único serviço permite:
- **Autenticação uniforme** — um único middleware valida o JWT Supabase para todos os endpoints
- **Isolamento do banco** — as queries ficam no backend; o frontend não precisa de acesso direto ao Supabase
- **Orquestração da IA** — o Gateway prepara os dados, chama o `ia-analyze` e persiste os resultados sem expor a complexidade ao cliente

## Responsabilidades

1. **Validar autenticação** via Supabase JWT (middleware `requireAuth`)
2. **Expor endpoints REST** para o frontend React
3. **Ler e escrever** no banco de dados Supabase
4. **Orquestrar a análise IA** — busca feedbacks, monta batches, chama `ia-analyze`, persiste resultados

## Localização no Monorepo

```
backends/api-gateway/
```

## Endpoints Disponíveis

### Protegidos (JWT obrigatório)

| Método | Caminho | Descrição |
|---|---|---|
| `GET` | `/protected/user/enterprise` | Dados da empresa |
| `PATCH` | `/protected/user/enterprise` | Atualiza empresa |
| `GET` | `/protected/user/collecting_data` | Configurações de coleta |
| `PATCH` / `PUT` | `/protected/user/collecting_data` | Atualiza / upsert coleta |
| `GET` | `/protected/user/feedbacks` | Lista feedbacks |
| `GET` | `/protected/user/feedbacks/stats` | Estatísticas |
| `GET` | `/protected/user/feedbacks/insights/report` | Relatório de insights |
| `GET` | `/protected/user/feedbacks/analysis` | Análises da IA |
| `POST` | `/protected/ia-analyze/analyze-raw` | Analisa feedbacks brutos |
| `POST` | `/protected/ia-analyze/regenerate-insights` | Regenera insights |

### Públicos (sem autenticação)

| Método | Caminho | Descrição |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/public/qrcode/:identifier` | Resolve QR Code |
| `POST` | `/public/feedback` | Submissão de feedback |

## Tecnologias

- **Runtime:** Node.js 20+ com TypeScript (ESM)
- **Framework:** Express
- **Auth:** Supabase JS Client v2 (validação de JWT)
- **Deploy:** Vercel (serverless)

## Veja Também

- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [Referência de Endpoints](./endpoints.md)
- [Regras de Negócio](./regras-negocio.md)
