# IA Analyze — Regras de Negócio

## Autenticação Interna

**O quê:** toda requisição deve incluir `X-Internal-Token` com o valor exato de `INTERNAL_SERVICE_TOKEN`.

**Por quê:** o serviço não tem autenticação de usuário. O token garante que apenas o API Gateway — e não agentes externos — pode acionar análises.

**Como é validado:** `utils/isInternalRequestAuthorized.ts` compara o header com a variável de ambiente. Se inválido, retorna `401` imediatamente, antes de qualquer processamento.

---

## Processamento de Batches

### Batches Vazios São Ignorados

Se um batch tiver `feedbacks = []` ou `feedbacks` não for um array, ele é **pulado silenciosamente**. O serviço não lança erro — apenas continua para o próximo batch.

### Idempotência por Feedback ID

Os resultados são acumulados em um `Map<string, Analysis>`. Se o mesmo `feedback_id` aparecer em dois batches diferentes (situação anômala), apenas a última análise prevalece.

---

## Validação de Sentimentos

Só três valores são aceitos:

```
'positive' | 'neutral' | 'negative'
```

Um item analisado pelo Gemini é **descartado silenciosamente** se:
- `feedback_id` não for uma string
- `sentiment` não estiver nos três valores válidos
- `feedback_id` não existir no mapa de feedbacks do batch atual

:::note
O descarte é silencioso por design — um sentimento inválido não deve interromper a análise dos demais feedbacks do batch.
:::

---

## Extração de Keywords

### Regras de Sanitização

Cada keyword sugerida pelo modelo passa por `sanitizeTermList`:

1. Deve ser uma string não-vazia após trim
2. Sua forma normalizada deve estar **contida** na mensagem normalizada do feedback
3. Não pode estar no conjunto de **termos proibidos**
4. Não pode ser duplicata

**Limite:** máximo de **6 keywords**.

### Fallback

Se nenhuma keyword passar na sanitização, `tokenizeRelevantWords` extrai palavras diretamente da mensagem (sem stop words, mínimo 3 caracteres). Retorna até **4 tokens**.

---

## Extração de Categorias

### Regras de Sanitização

Mesmas regras de keywords, com:

**Limite:** máximo de **4 categorias**.

### Fallback

Se nenhuma categoria for válida, retorna as **2 primeiras keywords** como fallback.

---

## Termos Proibidos

`buildForbiddenTerms` constrói um `Set<string>` com termos que nunca devem aparecer no resultado:

- Tokens do **nome da empresa** (`enterprise_context.enterprise_name`)
- Tokens do **nome do item de catálogo** (`catalog_item.name`)
- Tokens do **tipo do item** (ex: `produto`, `serviço`, `departamento`)
- Marcadores de sentimento em português (`positivo`, `negativo`, `neutro`, `bom`, `ruim`, etc.)

**Por quê:** evita que o modelo retorne o nome do próprio produto ou sentimentos explícitos como keyword — informações que já estão estruturadas em outros campos.

---

## Normalização de Texto

Antes de qualquer comparação, textos passam por `normalizeForComparison`:

1. Converte para minúsculas
2. Remove acentos (NFD + regex)
3. Remove pontuação e caracteres especiais
4. Colapsa espaços múltiplos

A comparação usa `includes()` nos textos normalizados, tolerando variações de acento e capitalização entre a sugestão do modelo e o texto original.

---

## Contexto de Batch (Global Insights)

`buildBatchContext` monta `IaAnalyzeContext` para cada batch:

```typescript
{
  scope_type: batch.scope_type,
  catalog_item_id: batch.catalog_item_id,
  catalog_item_name: batch.catalog_item_name,
  analyzedCount: batch.feedbacks.length,  // total de entrada, não de saída válida
  globalInsights: parsed.global_insights ?? null
}
```

:::note
`analyzedCount` reflete o total de feedbacks **enviados** no batch — não o número de análises válidas retornadas. Um feedback com sentimento inválido é contado aqui, mas descartado no `analyses[]`.
:::

---

## Tratamento de Erros do Gemini

| Cenário | Tipo de Erro | Código Retornado |
|---|---|---|
| Falha HTTP (`IaApiClientError` com código `failed_ia_request`) | `IaAnalyzeServiceError` 502 | `failed_ia_request` |
| Qualquer outro erro (JSON inválido, timeout, etc.) | `IaAnalyzeServiceError` 502 | `invalid_ai_response` |

O controller captura e retorna o status e código ao API Gateway, que repassa ao frontend.

---

## Troubleshooting

| Sintoma | Regra Violada | Diagnóstico |
|---|---|---|
| `analyses` retorna vazio para todos os feedbacks | Todos com sentimento inválido | Verifique se o prompt está retornando `positive`, `neutral` ou `negative` exatamente |
| Keywords e categorias sempre vazias | Termos não encontrados na mensagem | Verifique se `message` está sendo enviada corretamente no payload |
| `globalInsights` é sempre `null` | Gemini não retornou insights | Pode ser batch muito pequeno; experimente com mais feedbacks |
| `502 invalid_ai_response` frequente | Resposta do Gemini não parseável | Verifique `extractJsonFromText.ts`; pode ser mudança no formato de saída do modelo |
