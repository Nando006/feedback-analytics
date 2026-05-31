# Backend — Referência de Endpoints

> **Base URL (desenvolvimento):** `http://localhost:3000`

Todos os endpoints protegidos exigem o header:
```
Authorization: Bearer <supabase_jwt>
```

> **Nota:** todas as rotas são prefixadas com `/api` (ex.: `GET /api/health`).

---

## Health

### `GET /api/health`

Verifica se o serviço está operacional. Use para confirmar que o Gateway está rodando antes de fazer outras chamadas.

```bash
curl http://localhost:3000/api/health
```

**Response 200**
```json
{ "ok": true }
```

---

## Usuário (Conta)

### `GET /api/protected/user/auth_user`

Retorna o usuário autenticado, extraído do JWT (injetado por `requireAuth`).

**Response 200**
```json
{ "user": { "id": "uuid", "email": "gestor@empresa.com", "user_metadata": { "full_name": "Maria" } } }
```

---

### `PATCH /api/protected/user/email`

Inicia a troca de e-mail. O Supabase envia um link de confirmação para o novo endereço; a mudança só é efetivada após o callback.

**Body**
```json
{ "email": "novo@empresa.com" }
```

**Response 200**
```json
{ "user": { "id": "uuid", "email": "novo@empresa.com" } }
```

**Response 400** `invalid_payload` / `update_failed`.

---

### `PATCH /api/protected/user/metadados`

Atualiza metadados do usuário (ex.: `full_name`).

**Response 200**
```json
{ "user": { "id": "uuid", "email": "gestor@empresa.com", "user_metadata": { "full_name": "Maria" } } }
```

**Response 400** `invalid_payload` / `update_failed`.

---

### `POST /api/protected/user/phone/start`

Inicia a verificação de telefone — o Supabase envia um código por SMS.

**Body**
```json
{ "phone": "+5511999990000" }
```

**Response 200**
```json
{ "ok": true }
```

**Response 400** `invalid_payload` / `update_failed`.

---

### `POST /api/protected/user/phone/verify`

Confirma o código SMS recebido, efetivando a troca de telefone.

**Body**
```json
{ "phone": "+5511999990000", "token": "123456" }
```

**Response 200**
```json
{ "ok": true }
```

**Response 400** `invalid_payload` / `verify_failed`.

---

### `PATCH /api/protected/user/password`

Redefine a senha do usuário. Usado na etapa final do fluxo "Esqueci minha senha", com a sessão temporária estabelecida pelo callback de recuperação.

**Body**
```json
{ "password": "novaSenha123", "confirmPassword": "novaSenha123" }
```

**Response 200**
```json
{ "ok": true, "message": "Senha redefinida com sucesso." }
```

**Erros Possíveis**

| Status | Código | Descrição |
|---|---|---|
| `400` | `invalid_payload` | Body fora do schema |
| `400` | `reset_password_weak` | Senha muito fraca |
| `401` | `reset_password_invalid_token` | Link/sessão de recuperação expirado ou inválido |
| `400` | `reset_password_failed` | Falha genérica ao redefinir |

---

## Enterprise

### `GET /api/protected/user/enterprise`

Retorna os dados cadastrais da empresa associada ao usuário autenticado, incluindo o status do trial/assinatura.

**Response 200**
```json
{
  "enterprise": {
    "id": "uuid",
    "document": "12.345.678/0001-99",
    "account_type": "CNPJ",
    "terms_version": "v1",
    "terms_accepted_at": "2026-01-15T10:00:00Z",
    "created_at": "2026-01-15T10:00:00Z",
    "trial_ends_at": "2026-05-15T10:00:00Z",
    "subscription_status": "TRIAL"
  },
  "user": {
    "id": "uuid",
    "email": "gestor@empresa.com",
    "phone": "+5511999990000"
  }
}
```

> `full_name` não é retornado por este endpoint — vem do campo `phone` e `email` de `auth.users`, e de `user_metadata.full_name` retornados no objeto `user`.

---

### `PATCH /api/protected/user/enterprise`

Atualiza dados cadastrais parciais da empresa (termos, tipo de conta).

**Body (todos os campos são opcionais)**
```json
{
  "account_type": "CNPJ",
  "terms_version": "v2",
  "terms_accepted_at": "2026-05-24T10:00:00Z"
}
```

**Response 200** — mesmo formato de `GET /enterprise`.

---

### `GET /api/protected/user/collecting_data`

Retorna as configurações de coleta da empresa — tipos ativos, catálogo e perguntas.

**Response 200**
```json
{
  "uses_company_products": true,
  "uses_company_services": false,
  "uses_company_departments": false,
  "catalog_items": [...],
  "questions": [...]
}
```

---

### `PATCH /api/protected/user/collecting_data`

Atualiza parcialmente as configurações de coleta.

### `PUT /api/protected/user/collecting_data`

Upsert completo (cria se não existir, substitui se existir).

---

## Feedbacks

### `GET /api/protected/user/feedbacks`

Lista todos os feedbacks da empresa com paginação e filtros.

**Query Params**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `page` | `number` | Página atual (padrão: `1`) |
| `limit` | `number` | Itens por página (padrão: `10`) |
| `rating` | `number` | Filtra por nota (1–5) |
| `search` | `string` | Busca textual na mensagem |
| `item` | `string` | Filtra por nome do item de catálogo (busca parcial) |
| `category` | `COMPANY \| PRODUCT \| SERVICE \| DEPARTMENT` | Filtra por tipo de escopo |

**Response 200**
```json
{
  "feedbacks": [
    {
      "id": "uuid",
      "message": "Ótimo atendimento!",
      "rating": 5,
      "created_at": "2026-05-12T12:00:00Z",
      "collection_points": {
        "id": "uuid",
        "name": "Caixa Principal",
        "type": "enterprise",
        "catalog_item_name": null,
        "catalog_item_kind": null
      },
      "feedback_question_answers": []
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 42,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### `GET /api/protected/user/feedbacks/stats`

Retorna estatísticas agregadas dos feedbacks da empresa.

**Response 200**
```json
{
  "totalFeedbacks": 120,
  "averageRating": 4.2,
  "ratingDistribution": {
    "1": 3,
    "2": 12,
    "3": 25,
    "4": 40,
    "5": 40
  },
  "sentimentBreakdown": {
    "positive": 80,
    "neutral": 25,
    "negative": 15
  }
}
```

---

### `GET /api/protected/user/feedbacks/insights/report`

Retorna o relatório de insights armazenado no banco (leitura — não dispara nova análise).

**Query Params**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `scope_type` | `COMPANY \| PRODUCT \| SERVICE \| DEPARTMENT` | Filtra por escopo (padrão: `COMPANY`) |
| `catalog_item_id` | `string` | Filtra por item específico |

**Response 200**
```json
{
  "summary": "A maioria dos feedbacks é positiva, com destaque para atendimento.",
  "recommendations": ["Manter padrão de atendimento", "Reduzir tempo de espera"],
  "updatedAt": "2026-05-12T12:00:00Z",
  "scopeType": "COMPANY",
  "catalogItemId": null
}
```

> Quando não há relatório gerado ainda, retorna `summary: null` e `recommendations: []`.

---

### `GET /api/protected/user/feedbacks/analysis`

Retorna os feedbacks já analisados pela IA com sentimento, categorias e keywords por item. Usado pelo painel de analytics.

**Query Params**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `sentiment` | `positive \| neutral \| negative` | Filtra por sentimento |
| `scope_type` | `COMPANY \| PRODUCT \| SERVICE \| DEPARTMENT` | Filtra por escopo |
| `catalog_item_id` | `string` | Filtra por item específico |

**Response 200**
```json
{
  "items": [
    {
      "id": "uuid",
      "message": "Ótimo atendimento!",
      "rating": 5,
      "created_at": "2026-05-12T12:00:00Z",
      "sentiment": "positive",
      "categories": ["atendimento", "rapidez"],
      "keywords": ["excelente", "equipe"]
    }
  ],
  "summary": {
    "totalAnalyzed": 87,
    "sentiments": { "positive": 60, "neutral": 20, "negative": 7 },
    "topCategories": [{ "name": "atendimento", "count": 34 }],
    "topKeywords": [{ "name": "excelente", "count": 28 }]
  }
}
```

---

## QR Code (Gestão)

Endpoints protegidos para o gestor controlar os pontos de coleta (QR Codes) da empresa e do catálogo.

### `GET /api/protected/user/collection-points/qr/status`

Retorna se o QR Code da empresa (escopo `COMPANY`) está ativo.

**Response 200**
```json
{ "active": true, "id": "uuid | null" }
```

---

### `POST /api/protected/user/collection-points/qr/enable`

Ativa (ou cria) o ponto de coleta de QR Code da empresa.

**Response 200**
```json
{ "id": "uuid", "active": true }
```

---

### `POST /api/protected/user/collection-points/qr/disable`

Desativa o ponto de coleta de QR Code da empresa.

**Response 200**
```json
{ "active": false }
```

---

### `GET /api/protected/user/collection-points/qr/catalog`

Lista os itens de catálogo de um tipo, com o status do QR Code e o snapshot de perguntas de cada um.

**Query Params**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `kind` | `PRODUCT \| SERVICE \| DEPARTMENT` | Tipo de item de catálogo (obrigatório) |

**Response 200**
```json
{ "items": [ { "catalog_item_id": "uuid", "name": "Produto X", "active": true, "questions": [] } ] }
```

**Response 400** `collection_point_error` — `kind` inválido ou ausente.

---

### `POST /api/protected/user/collection-points/qr/catalog/questions/upsert`

Cria/atualiza as perguntas dinâmicas de um item de catálogo. Exige **exatamente 3 perguntas** (20–150 caracteres) e até 3 subperguntas por pergunta.

**Body**
```json
{
  "catalog_item_id": "uuid",
  "questions": [
    { "question_order": 1, "question_text": "...", "subquestions": [] }
  ]
}
```

**Response 200**
```json
{ "catalog_item_id": "uuid", "questions": [] }
```

**Response 400** `invalid_payload` — contagem/tamanho de perguntas inválido.

---

### `POST /api/protected/user/collection-points/qr/catalog/enable`

Ativa (ou cria) o QR Code de um item de catálogo específico.

**Body**
```json
{ "catalog_item_id": "uuid" }
```

**Response 200**
```json
{ "catalog_item_id": "uuid", "collection_point_id": "uuid", "active": true }
```

---

### `POST /api/protected/user/collection-points/qr/catalog/disable`

Desativa o QR Code de um item de catálogo específico.

**Body**
```json
{ "catalog_item_id": "uuid" }
```

**Response 200**
```json
{ "catalog_item_id": "uuid", "active": false }
```

---

## IA Analyze

### `POST /api/protected/ia-analyze/analyze-raw`

Analisa feedbacks **ainda não analisados** e persiste os resultados.

**Body**
```json
{
  "limit": 50,
  "scope_type": "PRODUCT",
  "catalog_item_id": "uuid-do-produto"
}
```

| Campo | Tipo | Obrigatório | Padrão |
|---|---|---|---|
| `limit` | `number` | Não | `50` (máx. `100`) |
| `scope_type` | `COMPANY \| PRODUCT \| SERVICE \| DEPARTMENT` | Não | todos |
| `catalog_item_id` | `string (UUID)` | Não | todos |

**Response 200**
```json
{
  "analyzedCount": 23,
  "feedbacksAnalyzed": [
    {
      "id": "uuid-analysis",
      "feedback_id": "uuid-feedback",
      "sentiment": "positive",
      "categories": ["atendimento", "rapidez"],
      "keywords": ["excelente", "equipe"]
    }
  ]
}
```

**Erros Possíveis**

| Status | Código | Descrição |
|---|---|---|
| `401` | `unauthorized` | JWT ausente ou inválido |
| `422` | `collecting_data_required_for_analysis` | Dados de contexto da empresa não preenchidos |
| `422` | `insufficient_feedbacks_for_analysis` | Menos de 10 feedbacks disponíveis |
| `502` | `failed_ia_request` | Falha na comunicação com o provedor LLM |
| `502` | `invalid_ai_response` | Provedor LLM retornou resposta inválida |

---

### `POST /api/protected/ia-analyze/regenerate-insights`

Regenera os insights globais com base nos feedbacks **já analisados**.

**Body**
```json
{
  "scope_type": "COMPANY",
  "catalog_item_id": null
}
```

**Response 200**
```json
{
  "globalInsights": {
    "summary": "...",
    "recommendations": ["..."]
  },
  "contexts": [
    {
      "scope_type": "COMPANY",
      "catalog_item_id": null,
      "catalog_item_name": null,
      "analyzedCount": 87,
      "globalInsights": { "summary": "...", "recommendations": ["..."] }
    }
  ]
}
```

**Erros Possíveis** — mesmos códigos de `analyze-raw`.

---

## Autenticação (Pública)

Endpoints sem JWT. A sessão é gerenciada por **cookie HttpOnly** (use `credentials: 'include'`).

### `POST /api/public/auth/login`

Autentica e cria a sessão (cookie).

**Body**
```json
{ "email": "gestor@empresa.com", "password": "senha123", "remember": true }
```

**Response 200**
```json
{ "ok": true, "user": { "id": "uuid", "email": "gestor@empresa.com" } }
```

**Erros Possíveis**

| Status | Código | Descrição |
|---|---|---|
| `400` | `invalid_payload` | Dados de login inválidos |
| `401` | `invalid_credentials` | E-mail ou senha incorretos **— também retornado quando o e-mail não foi confirmado (RNE-014, anti-enumeração)** |
| `429` | `rate_limited` | Muitas tentativas em pouco tempo |
| `503` | `service_unavailable` | Serviço de login indisponível |

---

### `POST /api/public/auth/logout`

Invalida a sessão no servidor (limpa o cookie).

**Response 204** — sem corpo.

---

### `POST /api/public/auth/register`

Cria uma nova conta. Por segurança (RNE-014), e-mail já cadastrado **não** é revelado: a resposta é a mesma de sucesso.

**Body**
```json
{
  "accountType": "CPF",
  "fullName": "Maria Silva",
  "document": "52998224725",
  "email": "maria@empresa.com",
  "phone": "+5511999990000",
  "password": "senha123",
  "confirmPassword": "senha123",
  "terms": true
}
```

**Response 200**
```json
{ "ok": true, "message": "confirmation_required" }
```

**Erros Possíveis**

| Status | Código | Descrição |
|---|---|---|
| `400` | `invalid_payload` | Dados de cadastro inválidos |
| `409` | `phone_taken` | Telefone já cadastrado |
| `409` | `document_taken` | Documento já cadastrado |
| `429` | `signup_failed` | Muitas tentativas (rate limit) |

> O e-mail duplicado **não** gera erro — retorna `200 confirmation_required` (anti-enumeração).

---

### `POST /api/public/auth/forgot-password`

Solicita o e-mail de redefinição de senha. A resposta é sempre genérica (não revela se o e-mail existe).

**Body**
```json
{ "email": "gestor@empresa.com" }
```

**Response 200**
```json
{ "ok": true, "message": "Se este e-mail estiver cadastrado, você receberá as instruções em breve." }
```

---

### `POST /api/public/auth/resend-confirmation`

Reenvia o e-mail de confirmação de cadastro.

**Body**
```json
{ "email": "gestor@empresa.com" }
```

**Response 200**
```json
{ "ok": true, "message": "E-mail de confirmação reenviado com sucesso." }
```

**Response 429** `rate_limited` — muitas solicitações de reenvio.

---

### `GET /api/public/auth/callback`

Processa o link clicado no e-mail (confirmação de cadastro, troca de e-mail ou recuperação de senha) e **redireciona** o navegador. Não retorna JSON.

**Query Params**

| Parâmetro | Descrição |
|---|---|
| `type` | `recovery` / `email_change` / (vazio = signup) |
| `token_hash` / `token` | Token do link |
| `next` | Caminho de destino após sucesso (padrão `/user/dashboard`) |

**Redirecionamentos**
- Sucesso → `/auth/success?next=<destino>`
- Link inválido/expirado → `/auth/link-expired`

---

## QR Code (Público)

### `GET /api/public/enterprise/:id`

Retorna os dados públicos de uma empresa **e as perguntas do escopo** para montar o formulário de feedback antes do envio.

**Query Params (opcionais)**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `collection_point` | `string` | ID do ponto de coleta (resolve o escopo/item) |
| `catalog_item` | `string` | ID do item de catálogo (alternativa ao ponto de coleta) |

> Quando o item de catálogo tem menos de 3 perguntas ativas, o backend faz fallback automático para as perguntas do escopo `COMPANY`.

**Response 200**
```json
{
  "id": "uuid",
  "name": "Empresa Exemplo",
  "collection_point_id": "uuid | null",
  "catalog_item_id": "uuid | null",
  "item_name": "Produto X | null",
  "item_kind": "PRODUCT | SERVICE | DEPARTMENT | null",
  "questions": [
    {
      "id": "uuid",
      "question_order": 1,
      "question_text": "Como você avalia o atendimento?",
      "subquestions": []
    }
  ]
}
```

> Os campos `full_name` e `status` **não** são retornados por este endpoint. A leitura é feita da view `enterprise_public` (apenas `id` e `name`).

**Response 404** `enterprise_not_found` — empresa inexistente.

---

### `POST /api/public/qrcode/feedback`

Submete um feedback via formulário público. Não requer autenticação. O `device_fingerprint` **não** é enviado pelo cliente — é calculado no backend como `MD5(userAgent | clientIP | dayEpoch)`.

**Body**
```json
{
  "enterprise_id": "uuid",
  "channel": "QRCODE",
  "rating": 5,
  "message": "Ótimo atendimento!",
  "answers": [
    { "question_id": "uuid", "answer_value": "OTIMA" },
    { "question_id": "uuid", "answer_value": "BOA" },
    { "question_id": "uuid", "answer_value": "MEDIANA" }
  ],
  "subanswers": [
    { "subquestion_id": "uuid", "answer_value": "BOA" }
  ],
  "collection_point_id": "uuid (opcional)",
  "catalog_item_id": "uuid (opcional)",
  "customer_name": "Maria (opcional)",
  "customer_email": "maria@exemplo.com (opcional)"
}
```

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `enterprise_id` | `string (UUID)` | Sim | — |
| `channel` | `"QRCODE"` | Sim | literal |
| `rating` | `number` | Sim | inteiro de 1 a 5 |
| `message` | `string` | Sim | 3 a 5000 caracteres |
| `answers` | `array` | Sim | **exatamente 3**; `answer_value` ∈ `PESSIMO\|RUIM\|MEDIANA\|BOA\|OTIMA` |
| `subanswers` | `array` | Não | deve cobrir **todas** as subperguntas ativas (máx. 9) |
| `collection_point_id` / `catalog_item_id` | `string (UUID)` | Não | resolvem o escopo |
| `customer_*` | vários | Não | dados opcionais de quem respondeu |

**Response 200**
```json
{ "ok": true }
```

**Response 400** `invalid_payload` — payload fora do schema, contagem de respostas incorreta ou `answer_score = 0`.

**Response 404** `enterprise_not_found` / `collection_point_not_found`.

**Response 409** `DEVICE_ALREADY_SUBMITTED` — dispositivo já enviou feedback para este ponto de coleta hoje (anti-spam diário).

**Response 403** `DEVICE_BLOCKED` — dispositivo permanentemente bloqueado (`is_blocked = true`).

---

## Troubleshooting Geral

| Sintoma | Causa Provável | O Que Verificar |
|---|---|---|
| `401` em qualquer endpoint protegido | JWT expirado ou ausente | Faça login novamente; verifique o header `Authorization` |
| `422 collecting_data_required` | Empresa sem dados de contexto | Preencha Objetivo e Resumo em Configurações da empresa |
| `422 insufficient_feedbacks_for_analysis` | Base de feedbacks pequena | Colete pelo menos 10 feedbacks antes de analisar |
| `502` nos endpoints de IA | Serviço `ia-analyze` offline ou provedor LLM com erro | Verifique se o serviço `ia-analyze` está rodando e se `GEMINI_API_KEY` está configurado |
| `409` no POST público | Fingerprint já registrado hoje neste ponto de coleta | Aguarde até o próximo dia ou use outro ponto de coleta |
| `403` no POST público | Dispositivo permanentemente bloqueado | Dispositivo marcado como `is_blocked` — requer intervenção manual |
