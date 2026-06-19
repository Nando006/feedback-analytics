# Backend — Referência de Endpoints

> **Base URL (desenvolvimento):** `http://localhost:3000`

Todos os endpoints protegidos usam a sessão que trafega por **cookies HttpOnly** (gerenciada via `@supabase/ssr`). O cliente deve enviar as requisições com `credentials: 'include'`. **Não** há header `Authorization: Bearer`.

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

**Response 200** — tudo aninhado em `collecting` (ou `{ "collecting": null }` quando não há registro).
```json
{
  "collecting": {
    "id": "uuid",
    "enterprise_id": "uuid",
    "company_objective": "...",
    "analytics_goal": "...",
    "business_summary": "...",
    "main_products_or_services": "...",
    "uses_company_products": true,
    "uses_company_services": false,
    "uses_company_departments": false,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-15T10:00:00Z",
    "catalog_products": [...],
    "catalog_services": [...],
    "catalog_departments": [...],
    "company_feedback_questions": [...]
  }
}
```

---

### `PATCH /api/protected/user/collecting_data`

Atualiza parcialmente as configurações de coleta. **Response 200** — mesmo formato de `GET` (objeto `collecting`).

### `PUT /api/protected/user/collecting_data`

Upsert completo (cria se não existir, substitui se existir). **Response 200** — mesmo formato de `GET` (objeto `collecting`).

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
        "type": "QR_CODE",
        "identifier": "uuid | null",
        "catalog_item_id": "uuid | null",
        "catalog_item_name": null,
        "catalog_item_kind": null,
        "catalog_items": null
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

**Query Params**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `scope_type` | `COMPANY \| PRODUCT \| SERVICE \| DEPARTMENT` | Segmenta as estatísticas por escopo (padrão: `COMPANY`) |
| `catalog_item_id` | `string` | Segmenta por item de catálogo específico |

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
  },
  "totalAnalyzed": 87,
  "pendingCount": 33,
  "latestAnalysisAt": "2026-06-18T09:30:00Z",
  "starMean": 4.2,
  "starMeanCI": { "lower": 4.05, "upper": 4.35 },
  "netSatisfaction": 53.3,
  "csat": { "pct": 66.7, "ci": { "lower": 57.8, "upper": 74.5 } },
  "confidenceTier": "good",
  "aiSentiment": {
    "positive": 60,
    "neutral": 20,
    "negative": 7,
    "netSentimentScore": 60.9,
    "confidenceTier": "moderate"
  }
}
```

O endpoint expõe **duas lentes** complementares, ambas segmentadas pelo escopo (`scope_type` / `catalog_item_id`):

- **Lente SATISFAÇÃO (estrelas):** `starMean` (média de notas 1–5) com `starMeanCI` (IC t, em unidade de nota), `netSatisfaction` (%(4–5) − %(1–2), em [-100,100]), `csat` (Top-2-Box: % de notas 4–5 + IC de Wilson em %) e `confidenceTier` pela quantidade de feedbacks no escopo.
- **Lente SENTIMENTO (IA/texto):** `aiSentiment` agrega o sentimento classificado pela IA sobre o **subconjunto já analisado**, com `netSentimentScore` (NSS = (pos−neg)/analisados × 100) e `confidenceTier` por quantidade analisada. **Só está presente quando `totalAnalyzed > 0`** (omitido caso contrário).

`totalAnalyzed`/`pendingCount` indicam quantos feedbacks do escopo já têm análise da IA e quantos faltam (`totalFeedbacks − totalAnalyzed`); `latestAnalysisAt` é o timestamp ISO da análise mais recente (ou `null`).

> `sentimentBreakdown` é derivado **por estrela** (positive = notas 4–5, neutral = 3, negative = 1–2) e mantido por **compatibilidade**. O sentimento real do texto vem da IA em `aiSentiment` — as duas leituras podem divergir.
>
> `confidenceTier` ∈ `insufficient` (<10) · `low` (10–29) · `moderate` (30–99) · `good` (100+).

---

### `GET /api/protected/user/feedbacks/questions`

Retorna métricas agregadas **por pergunta e subpergunta** no escopo selecionado, na escala 1–5. São métricas **determinísticas** — calculadas só sobre as respostas estruturadas (nota por rótulo), **não dependem da IA**. Usado pela aba "Perguntas".

**Query Params**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `scope_type` | `COMPANY \| PRODUCT \| SERVICE \| DEPARTMENT` | Segmenta por escopo |
| `catalog_item_id` | `string` | Segmenta por item de catálogo específico |

**Response 200** — `questions` ordenado **pior → melhor** (menor nota média no topo).
```json
{
  "questions": [
    {
      "question_id": "uuid",
      "text": "Como você avalia o atendimento?",
      "count": 42,
      "mean": 3.4,
      "ci": { "lower": 3.1, "upper": 3.7 },
      "satisfiedPct": 55.0,
      "distribution": {
        "PESSIMO": 4,
        "RUIM": 6,
        "MEDIANA": 9,
        "BOA": 12,
        "OTIMA": 11
      },
      "confidenceTier": "moderate",
      "status": "current",
      "subquestions": [
        {
          "subquestion_id": "uuid",
          "text": "O tempo de espera foi adequado?",
          "count": 30,
          "mean": 3.1,
          "ci": { "lower": 2.8, "upper": 3.4 },
          "satisfiedPct": 50.0,
          "distribution": {
            "PESSIMO": 3,
            "RUIM": 5,
            "MEDIANA": 7,
            "BOA": 9,
            "OTIMA": 6
          },
          "confidenceTier": "moderate",
          "status": "current"
        }
      ]
    }
  ]
}
```

Por pergunta (e por subpergunta): `mean` (nota média 1–5), `ci` (faixa provável da média, IC t em unidade de nota), `satisfiedPct` (% de respostas BOA+ÓTIMA), `distribution` (contagem por rótulo `PESSIMO`/`RUIM`/`MEDIANA`/`BOA`/`OTIMA`), `confidenceTier` (pela quantidade de respostas) e `status`:

- `current` — pergunta ativa e com o texto atual da configuração;
- `deactivated` — a configuração ainda tem esta redação, mas está desativada (toggle off);
- `past` — redação antiga (texto editado) ou pergunta removida da configuração.

> Cada redação distinta de uma mesma pergunta vira uma entrada própria (o `question_id` é estável; o snapshot de texto pode mudar), o que separa "atuais" de "antigas".
>
> Escopo sem feedbacks (ou item inexistente) → `{ "questions": [] }`.

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
      "keywords": ["excelente", "equipe"],
      "discrepancy": null,
      "aspects": [
        { "aspect": "atendimento", "sentiment": "positive", "sentiment_score": 0.8 }
      ],
      "sentiment_score": 0.75,
      "confidence": 0.92
    }
  ],
  "summary": {
    "totalAnalyzed": 87,
    "sentiments": { "positive": 60, "neutral": 20, "negative": 7 },
    "topCategories": [
      { "name": "atendimento", "count": 34, "proportion": 0.39, "ci": { "lower": 0.29, "upper": 0.5 } }
    ],
    "topKeywords": [
      { "name": "excelente", "count": 28, "proportion": 0.32, "ci": { "lower": 0.23, "upper": 0.43 } }
    ],
    "netSentimentScore": 60.9,
    "sentimentCIs": {
      "positive": { "lower": 0.59, "upper": 0.78 },
      "neutral": { "lower": 0.15, "upper": 0.33 },
      "negative": { "lower": 0.04, "upper": 0.16 }
    },
    "confidenceTier": "moderate",
    "aspectSentiments": [
      {
        "aspect": "tempo de espera",
        "positive": 4,
        "neutral": 3,
        "negative": 12,
        "count": 19,
        "netSentimentScore": -42.1,
        "ci": { "lower": 0.09, "upper": 0.45 }
      }
    ]
  }
}
```

Por item, além de `sentiment`/`categories`/`keywords`:

- `aspects[]` — sentimento por aspecto (ABSA) extraído do texto (`{ aspect, sentiment, sentiment_score }`);
- `sentiment_score` — intensidade graduada do sentimento geral em [-1, 1];
- `confidence` — confiança da classificação em [0, 1];
- `discrepancy` — divergência entre a nota (estrela) e o sentimento do texto: `silent_detractor` (nota alta + texto negativo), `rating_misuse` (nota baixa + texto positivo) ou `null`.

No `summary`: `netSentimentScore` (NSS sobre os analisados), `sentimentCIs` (IC de Wilson por classe, em fração 0..1), `confidenceTier` e `aspectSentiments[]` (ABSA agregado, com gate de menção mínima 3 e ordenado por impacto volume × |NSS|, top 12). `topCategories`/`topKeywords` passam a trazer `{ name, count, proportion, ci }`, ranqueados pelo **limite inferior de Wilson** da proporção (top 10 cada).

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
{ "items": [ { "catalog_item_id": "uuid", "name": "Produto X", "description": "...", "kind": "PRODUCT", "active": true, "collection_point_id": "uuid | null", "questions": [] } ] }
```

**Response 400** `collection_point_error` — `kind` inválido ou ausente.

---

### `POST /api/protected/user/collection-points/qr/catalog/questions/upsert`

Cria/atualiza as perguntas dinâmicas de um item de catálogo. O gestor preenche **1 a 3 perguntas efetivas** (20–150 caracteres cada; slots vazios são ignorados — **não** é exigido "exatamente 3") e até 3 subperguntas por pergunta. Esvaziar um slot faz **soft-delete** (`is_active = false`), preservando o histórico de respostas; o editor lê apenas registros `is_active = true`.

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
      "keywords": ["excelente", "equipe"],
      "aspects": [
        { "aspect": "atendimento", "sentiment": "positive", "sentiment_score": 0.8 }
      ],
      "sentiment_score": 0.75,
      "confidence": 0.92
    }
  ]
}
```

> Os itens persistidos carregam também `aspects[]` (ABSA por aspecto), `sentiment_score` (intensidade do sentimento geral em [-1, 1]) e `confidence` (confiança da classificação em [0, 1]). O mínimo de **10 feedbacks é por escopo** (`422` se insuficiente).

**Erros Possíveis**

| Status | Código | Descrição |
|---|---|---|
| `401` | `unauthorized` | JWT ausente ou inválido |
| `422` | `collecting_data_required_for_analysis` | Dados de contexto da empresa não preenchidos |
| `422` | `insufficient_feedbacks_for_analysis` | Menos de 10 feedbacks disponíveis no escopo |
| `500` | `missing_ia_analyze_remote_url` | Em runtime serverless (`VERCEL=1`) sem `IA_ANALYZE_REMOTE_URL` configurada |
| `500` | `failed_to_fetch_feedbacks_for_ia` | Falha ao buscar/resolver o escopo dos feedbacks a analisar |
| `500` | `failed_to_fetch_analyzed_feedbacks` | Falha ao buscar/resolver o escopo dos feedbacks já analisados |
| `502` | `failed_remote_ia_analyze_request` | Falha na comunicação com o serviço `ia-analyze` |
| `502` | `remote_ia_analyze_error` | Serviço `ia-analyze` retornou status de erro |
| `502` | `invalid_remote_ia_analyze_response_shape` | Resposta do serviço `ia-analyze` com formato inválido |

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
  ],
  "reportGenerated": true
}
```

> `reportGenerated` é `true` **somente** quando um relatório foi de fato persistido para o escopo pedido (com escopo informado: existe relatório salvo para `scope_type` + item; sem escopo: ao menos um relatório foi salvo). Permite ao cliente detectar o "falso sucesso" — quando nada é gerado por falta de feedbacks com texto analisados suficientes.

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
| `400` | `document_required` | Documento obrigatório ausente |
| `400` | `database_error` | Falha ao salvar o novo usuário |
| `409` | `phone_taken` | Telefone já cadastrado |
| `409` | `document_taken` | Documento já cadastrado |
| `400` | `signup_failed` | Falha de cadastro (e-mail/senha inválidos, captcha ou erro genérico) |
| `429` | `signup_failed` | Muitas tentativas (rate limit) |
| `502` | `signup_failed` | Falha ao enviar o e-mail de confirmação |
| `503` | `signup_failed` | Novos cadastros temporariamente indisponíveis |

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

> O backend retorna **exatamente** as perguntas ativas configuradas para o escopo resolvido (0 a 3) — **nunca** faz fallback para o escopo `COMPANY`. Quando não há perguntas ativas, `questions` vem vazio (o formulário exibe apenas nota + mensagem).

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
| `answers` | `array` | Sim | contagem variável (0 a 3), igual ao número de perguntas ativas do escopo; `answer_value` ∈ `PESSIMO\|RUIM\|MEDIANA\|BOA\|OTIMA` |
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
| `422 collecting_data_required` | Empresa sem dados de contexto | Preencha os três campos obrigatórios (`company_objective`, `analytics_goal` e `business_summary`) em Configurações da empresa |
| `422 insufficient_feedbacks_for_analysis` | Base de feedbacks pequena | Colete pelo menos 10 feedbacks antes de analisar |
| `502` nos endpoints de IA | Serviço `ia-analyze` offline ou provedor LLM com erro | Verifique se o serviço `ia-analyze` está rodando e se `IA_ANALYZE_REMOTE_URL` / `IA_ANALYZE_REMOTE_TOKEN` estão configurados no gateway (a `GEMINI_API_KEY` é do serviço `ia-analyze`, não do gateway) |
| `409` no POST público | Fingerprint já registrado hoje neste ponto de coleta | Aguarde até o próximo dia ou use outro ponto de coleta |
| `403` no POST público | Dispositivo permanentemente bloqueado | Dispositivo marcado como `is_blocked` — requer intervenção manual |
