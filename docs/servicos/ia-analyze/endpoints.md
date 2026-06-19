# IA Analyze — Endpoints

> **Base URL (desenvolvimento):** `http://localhost:4100`

:::warning Serviço Interno
Esta API é exclusivamente para comunicação interna. Nunca exponha esses endpoints diretamente ao frontend. Todo acesso deve vir do API Gateway, que injeta o token de autenticação interna.
:::

---

## Health Check

### `GET /internal/health` · `GET /internal/ia-analyze/health`

Verifica se o serviço está operacional. Ambas as rotas retornam o mesmo resultado.

```bash
curl http://localhost:4100/internal/health
```

**Response 200**
```json
{ "ok": true, "service": "ia-analyze" }
```

---

## Análise de Feedbacks

### `POST /internal/ia-analyze/analyze`

Recebe lotes de feedbacks e retorna análises individuais por feedback e contextos de insights por lote.

**Headers**
```
x-ia-analyze-token: <IA_ANALYZE_INTERNAL_TOKEN>
Content-Type: application/json
```

> **Nota:** o token é **opcional**. Se `IA_ANALYZE_INTERNAL_TOKEN` não estiver definido no ambiente do serviço, todas as requisições são aceitas — comportamento intencional para desenvolvimento local.

**Schema do Body**

```typescript
// IaAnalyzeRemoteRunRequest
{
  enterprise_context: {
    enterprise_name: string | null,
    company_objective: string | null,
    analytics_goal: string | null,
    business_summary: string | null,
    main_products_or_services: string[] | null
  },
  batches: Array<{
    scope_type: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT',
    catalog_item_id: string | null,
    catalog_item_name: string | null,
    feedbacks: Array<{
      id: string,
      message: string,
      rating: number | null,
      created_at: string | null,
      scope_type: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT',
      collection_point: { id, name, type, identifier } | null,
      catalog_item: { id, name, kind, description } | null,
      dynamic_answers: IaAnalyzeDynamicAnswer[],
      dynamic_subanswers: IaAnalyzeDynamicSubanswer[]
    }>
  }>
}
```

**Exemplo Completo**

```json
{
  "enterprise_context": {
    "enterprise_name": "Restaurante Bella Vista",
    "company_objective": "Ser referência em atendimento",
    "analytics_goal": "Reduzir feedbacks negativos em 20%",
    "business_summary": "Restaurante italiano fundado em 2010",
    "main_products_or_services": ["Massa artesanal", "Risoto", "Vinho"]
  },
  "batches": [
    {
      "scope_type": "PRODUCT",
      "catalog_item_id": "uuid-do-prato",
      "catalog_item_name": "Risoto de Funghi",
      "feedbacks": [
        {
          "id": "uuid-feedback-1",
          "message": "Risoto perfeito, muito cremoso e saboroso!",
          "rating": 5,
          "created_at": "2026-05-12T12:00:00Z",
          "scope_type": "PRODUCT",
          "collection_point": null,
          "catalog_item": {
            "id": "uuid-do-prato",
            "name": "Risoto de Funghi",
            "kind": "PRODUCT",
            "description": "Risoto cremoso com funghi porcini"
          },
          "dynamic_answers": [],
          "dynamic_subanswers": []
        }
      ]
    }
  ]
}
```

**Response 200**

```typescript
// IaAnalyzeRemoteRunResponse
{
  analyses: Array<{
    feedback_id: string,
    sentiment: 'positive' | 'neutral' | 'negative',
    categories: string[],   // máx. 4
    keywords: string[],     // máx. 6
    sentiment_score?: number,  // intensidade graduada do sentimento geral em [-1, 1]
    confidence?: number,       // confiança da classificação em [0, 1]
    aspects?: Array<{          // ABSA: sentimento por aspecto, ancorado no texto (máx. 6)
      aspect: string,
      sentiment: 'positive' | 'neutral' | 'negative',
      sentiment_score?: number
    }>
  }>,
  contexts: Array<{
    scope_type: 'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT',
    catalog_item_id: string | null,
    catalog_item_name: string | null,
    analyzedCount: number,
    globalInsights: {
      summary: string,
      recommendations: string[]
    } | null
  }>
}
```

**Exemplo de Response**

```json
{
  "analyses": [
    {
      "feedback_id": "uuid-feedback-1",
      "sentiment": "positive",
      "categories": ["sabor", "textura"],
      "keywords": ["cremoso", "perfeito", "saboroso"],
      "sentiment_score": 0.85,
      "confidence": 0.92,
      "aspects": [
        { "aspect": "sabor", "sentiment": "positive", "sentiment_score": 0.9 },
        { "aspect": "textura", "sentiment": "positive", "sentiment_score": 0.8 }
      ]
    }
  ],
  "contexts": [
    {
      "scope_type": "PRODUCT",
      "catalog_item_id": "uuid-do-prato",
      "catalog_item_name": "Risoto de Funghi",
      "analyzedCount": 1,
      "globalInsights": {
        "summary": "Feedbacks altamente positivos com destaque para cremosidade.",
        "recommendations": ["Manter a receita original", "Considerar opção sem glúten"]
      }
    }
  ]
}
```

> **Nota:** `keywords` e `categorias` são sempre retornadas **normalizadas** — minúsculas, sem acento e sem pontuação (ex.: `"Atendimento Ágil"` vira `"atendimento agil"`).

---

## Erros

| Status | Código | Causa |
|---|---|---|
| `400` | `invalid_payload` | `enterprise_context` ou `batches` ausentes no body |
| `401` | `unauthorized_internal_request` | Header `x-ia-analyze-token` ausente ou incorreto |
| `500` | `missing_gemini_api_key` | `GEMINI_API_KEY` não configurado no ambiente |
| `502` | `failed_ia_request` | Falha ao chamar o provedor LLM (erro do SDK, credencial ou rede), propagada apenas após esgotar o retry/backoff do provider |
| `502` | `invalid_ai_response` | Provedor LLM retornou resposta não parseável como JSON ou saída truncada (`finishReason=MAX_TOKENS`) |

**Formato de todos os erros:**
```json
{
  "error": "codigo_do_erro",
  "message": "Descrição legível do problema"
}
```

---

## Troubleshooting

| Sintoma | Causa | Solução |
|---|---|---|
| `401` em toda requisição | Token interno errado | Iguale `IA_ANALYZE_INTERNAL_TOKEN` no Gateway e no IA Analyze |
| `500 missing_gemini_api_key` | Variável não configurada | Adicione `GEMINI_API_KEY` ao `.env` do serviço |
| `502 failed_ia_request` | Provedor LLM inacessível | Verifique a chave de API e a conectividade com a internet. Só é propagado **após esgotar o retry/backoff** do provider (até 4 tentativas, com backoff exponencial + jitter e respeito ao `retryDelay` do Gemini) |
| `502 invalid_ai_response` | Modelo retornou JSON malformado **ou** saída truncada (`finishReason=MAX_TOKENS`) | Tente novamente; pode ser instabilidade do modelo. Se for truncamento recorrente, reduza o tamanho dos lotes (`IA_MAX_FEEDBACKS_PER_BATCH`) |
| Analyses vazias (`analyses: []`) | Todos os feedbacks com sentimento inválido | Verifique se os feedbacks têm `message` não-vazia |
