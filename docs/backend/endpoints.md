# Backend — Referência de Endpoints

> **Base URL (desenvolvimento):** `http://localhost:3001`

Todos os endpoints protegidos exigem o header:
```
Authorization: Bearer <supabase_jwt>
```

---

## Health

### `GET /health`

Verifica se o serviço está operacional. Use para confirmar que o Gateway está rodando antes de fazer outras chamadas.

```bash
curl http://localhost:3001/health
```

**Response 200**
```json
{ "ok": true }
```

---

## Enterprise

### `GET /protected/user/enterprise`

Retorna os dados da empresa associada ao usuário autenticado.

**Response 200**
```json
{
  "id": "uuid",
  "full_name": "Empresa Exemplo",
  "company_objective": "Melhorar a satisfação dos clientes",
  "analytics_goal": "Reduzir NPS negativo em 20%",
  "business_summary": "Restaurante familiar com 15 anos de mercado",
  "main_products_or_services": ["Hambúrguer Artesanal", "Batata Frita"]
}
```

---

### `PATCH /protected/user/enterprise`

Atualiza dados parciais da empresa.

**Body (todos os campos são opcionais)**
```json
{
  "full_name": "Novo Nome",
  "company_objective": "...",
  "analytics_goal": "...",
  "business_summary": "...",
  "main_products_or_services": ["..."]
}
```

---

### `GET /protected/user/collecting_data`

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

### `PATCH /protected/user/collecting_data`

Atualiza parcialmente as configurações de coleta.

### `PUT /protected/user/collecting_data`

Upsert completo (cria se não existir, substitui se existir).

---

## Feedbacks

### `GET /protected/user/feedbacks`

Lista todos os feedbacks da empresa. Suporta paginação e filtros por escopo.

**Query Params**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `limit` | `number` | Máximo de resultados |
| `offset` | `number` | Paginação |
| `scope_type` | `COMPANY \| PRODUCT \| SERVICE \| DEPARTMENT` | Filtra por escopo |
| `catalog_item_id` | `string (UUID)` | Filtra por item |

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "message": "Ótimo atendimento!",
      "rating": 5,
      "created_at": "2026-05-12T12:00:00Z",
      "catalog_item": { "id": "uuid", "name": "Hambúrguer", "kind": "PRODUCT" }
    }
  ],
  "count": 42
}
```

---

### `GET /protected/user/feedbacks/stats`

Retorna estatísticas agregadas dos feedbacks da empresa.

**Response 200**
```json
{
  "total": 120,
  "positive": 80,
  "neutral": 25,
  "negative": 15,
  "averageRating": 4.2
}
```

---

### `GET /protected/user/feedbacks/insights/report`

Retorna o relatório de insights armazenado no banco (leitura — não dispara nova análise).

**Query Params**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `scope_type` | `string` | Filtra por escopo |
| `catalog_item_id` | `string` | Filtra por item |

**Response 200**
```json
{
  "globalInsights": {
    "summary": "...",
    "recommendations": ["..."]
  },
  "contexts": [...]
}
```

---

## IA Analyze

### `POST /protected/ia-analyze/analyze-raw`

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
| `502` | `failed_ia_request` | Falha na comunicação com o Gemini |
| `502` | `invalid_ai_response` | Gemini retornou resposta inválida |

---

### `POST /protected/ia-analyze/regenerate-insights`

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

### `GET /public/qrcode/:identifier`

Resolve um QR Code pelo identificador único e retorna o formulário configurado.

**Response 200**
```json
{
  "collection_point": {
    "id": "uuid",
    "name": "Caixa Principal",
    "type": "enterprise",
    "identifier": "abc123"
  },
  "questions": [...]
}
```

---

### `POST /public/feedback`

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

**Response 200**
```json
{ "ok": true }
```

**Response 429** — dispositivo enviou feedback recentemente (cooldown ativo).

---

## Troubleshooting Geral

| Sintoma | Causa Provável | O Que Verificar |
|---|---|---|
| `401` em qualquer endpoint protegido | JWT expirado ou ausente | Faça login novamente; verifique o header `Authorization` |
| `422 collecting_data_required` | Empresa sem dados de contexto | Preencha Objetivo e Resumo em Configurações da empresa |
| `422 insufficient_feedbacks` | Base de feedbacks pequena | Colete pelo menos 5 feedbacks antes de analisar |
| `502` nos endpoints de IA | IA Analyze offline ou Gemini com erro | Verifique se o serviço `ia-analyze` está rodando e se `GEMINI_API_KEY` está configurado |
| `429` no POST público | Fingerprint em cooldown | Aguarde o período de cooldown antes de tentar novamente |
