# Backend — Visão Geral (API Gateway)

## O Que É

O `api-gateway` é o **Backend-for-Frontend (BFF)** do sistema. Ele é o único ponto de entrada do backend — o frontend nunca acessa o banco de dados ou o serviço de IA diretamente.

## Por Que Existe

Centralizar o backend permite:
- **Autenticação uniforme** — um único middleware valida o JWT Supabase para todos os endpoints
- **Isolamento do banco** — as queries ficam no backend; o frontend não precisa de acesso direto ao Supabase
- **Orquestração da IA** — o Gateway prepara os dados, chama o `ia-analyze` e persiste os resultados sem expor a complexidade ao cliente

## Responsabilidades

1. **Validar autenticação** via Supabase JWT (middleware `requireAuth`)
2. **Expor endpoints REST** para o frontend React
3. **Ler e escrever** no banco de dados Supabase
4. **Orquestrar serviços** — busca feedbacks, monta batches, chama `ia-analyze`, persiste resultados

## Localização no Monorepo

```
backends/api-gateway/
```

## Endpoints Disponíveis

### Protegidos (JWT obrigatório)

| Método | Caminho | Descrição |
|---|---|---|
| `GET` | `/api/protected/user/auth_user` | Dados do usuário autenticado (do JWT) |
| `PATCH` | `/api/protected/user/email` | Atualiza e-mail (envia confirmação) |
| `PATCH` | `/api/protected/user/metadados` | Atualiza metadados do usuário (ex.: nome) |
| `POST` | `/api/protected/user/phone/start` | Inicia verificação de telefone (envia SMS) |
| `POST` | `/api/protected/user/phone/verify` | Confirma o código SMS do telefone |
| `PATCH` | `/api/protected/user/password` | Redefine a senha (usa sessão de recuperação) |
| `GET` | `/api/protected/user/enterprise` | Dados da empresa |
| `PATCH` | `/api/protected/user/enterprise` | Atualiza empresa |
| `GET` | `/api/protected/user/collecting_data` | Configurações de coleta |
| `PATCH` / `PUT` | `/api/protected/user/collecting_data` | Atualiza / upsert coleta |
| `GET` | `/api/protected/user/feedbacks` | Lista feedbacks |
| `GET` | `/api/protected/user/feedbacks/stats` | Estatísticas |
| `GET` | `/api/protected/user/feedbacks/insights/report` | Relatório de insights |
| `GET` | `/api/protected/user/feedbacks/analysis` | Análises da IA |
| `GET` | `/api/protected/user/collection-points/qr/status` | Status do QR Code da empresa |
| `POST` | `/api/protected/user/collection-points/qr/enable` | Ativa o QR Code da empresa |
| `POST` | `/api/protected/user/collection-points/qr/disable` | Desativa o QR Code da empresa |
| `GET` | `/api/protected/user/collection-points/qr/catalog` | Lista itens de catálogo + status de QR (query `kind`) |
| `POST` | `/api/protected/user/collection-points/qr/catalog/questions/upsert` | Upsert das perguntas de um item de catálogo |
| `POST` | `/api/protected/user/collection-points/qr/catalog/enable` | Ativa o QR Code de um item de catálogo |
| `POST` | `/api/protected/user/collection-points/qr/catalog/disable` | Desativa o QR Code de um item de catálogo |
| `POST` | `/api/protected/ia-analyze/analyze-raw` | Analisa feedbacks brutos |
| `POST` | `/api/protected/ia-analyze/regenerate-insights` | Regenera insights |

### Públicos (sem autenticação)

| Método | Caminho | Descrição |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/public/auth/login` | Login (cria sessão via cookie) |
| `POST` | `/api/public/auth/logout` | Logout (invalida o cookie) |
| `POST` | `/api/public/auth/register` | Cadastro de nova conta |
| `POST` | `/api/public/auth/forgot-password` | Solicita e-mail de redefinição de senha |
| `POST` | `/api/public/auth/resend-confirmation` | Reenvia o e-mail de confirmação de cadastro |
| `GET` | `/api/public/auth/callback` | Callback de confirmação/recuperação (redireciona) |
| `GET` | `/api/public/enterprise/:id` | Dados públicos da empresa + perguntas para o formulário |
| `POST` | `/api/public/qrcode/feedback` | Submissão de feedback via QR Code |

## Tecnologias

- **Runtime:** Node.js 20+ com TypeScript (ESM)
- **Framework:** Express
- **Auth:** Supabase JS Client v2 (validação de JWT)
- **Deploy:** Vercel (serverless)

## Veja Também

- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [Referência de Endpoints](./endpoints.md)
- [Regras de Negócio](../regras-negocio.md)
