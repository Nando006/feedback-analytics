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
| `422` | `insufficient_feedbacks_for_analysis` | Menos de 5 feedbacks disponíveis |
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

## QR Code (Público)

### `GET /api/public/enterprise/:id`

Retorna os dados públicos de uma empresa para validação antes de exibir o formulário de feedback.

**Response 200**
```json
{
  "id": "uuid",
  "full_name": "Empresa Exemplo",
  "status": "ACTIVE"
}
```

---

### `POST /api/public/qrcode/feedback`

Submete um feedback via formulário público. Não requer autenticação.

**Body**
```json
{
  "collection_point_id": "uuid",
  "message": "Ótimo atendimento!",
  "rating": 5,
  "device_fingerprint": "hash-do-dispositivo",
  "dynamic_answers": [],
  "dynamic_subanswers": []
}
```

**Response 201**
```json
{ "ok": true }
```

**Response 409** — dispositivo já enviou feedback para este ponto de coleta hoje (anti-spam diário).

**Response 403** — dispositivo permanentemente bloqueado (`is_blocked = true`).

---

## Troubleshooting Geral

| Sintoma | Causa Provável | O Que Verificar |
|---|---|---|
| `401` em qualquer endpoint protegido | JWT expirado ou ausente | Faça login novamente; verifique o header `Authorization` |
| `422 collecting_data_required` | Empresa sem dados de contexto | Preencha Objetivo e Resumo em Configurações da empresa |
| `422 insufficient_feedbacks` | Base de feedbacks pequena | Colete pelo menos 5 feedbacks antes de analisar |
| `502` nos endpoints de IA | Serviço `ia-analyze` offline ou provedor LLM com erro | Verifique se o serviço `ia-analyze` está rodando e se `GEMINI_API_KEY` está configurado |
| `409` no POST público | Fingerprint já registrado hoje neste ponto de coleta | Aguarde até o próximo dia ou use outro ponto de coleta |
| `403` no POST público | Dispositivo permanentemente bloqueado | Dispositivo marcado como `is_blocked` — requer intervenção manual |
