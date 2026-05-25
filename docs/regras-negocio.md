# Regras de Negócio

## API Gateway

### Autenticação e Isolamento de Dados

**Como funciona:** todo endpoint em `/protected/*` passa pelo middleware `requireAuth`, que valida o JWT via Supabase e injeta `req.user` e `req.supabase` na request.

**Regra de isolamento:** o `userId` extraído do JWT é usado em todas as queries. Nenhum endpoint retorna dados de outra empresa — o isolamento é garantido em duas camadas: no nível de **repositório** (filtros no código) e diretamente no banco de dados via **RLS (Row Level Security)** do Supabase.

> ⚠️ **Aviso:** Nunca passe `userId` como parâmetro de query string ou body em endpoints protegidos. O Gateway extrai o ID do JWT, não do payload da requisição.

---

### Assinatura e Trial

#### Ciclo de Vida da Conta

Todo novo cadastro tem `subscription_status = 'TRIAL'` e `trial_ends_at = NOW() + 4 meses`, inicializados automaticamente pelo trigger `on_auth_user_created` no banco de dados.

| `subscription_status` | Significado |
|---|---|
| `TRIAL` | Conta em período de teste gratuito — acesso completo |
| `ACTIVE` | Assinatura paga ativa |
| `EXPIRED` | Período de trial encerrado sem conversão |
| `CANCELED` | Assinatura cancelada pelo gestor |

O campo `trial_ends_at` é uma timestamp com fuso horário (`timestamptz`). O cálculo de dias restantes é feito no cliente para evitar chamadas extras.

#### Confirmação de E-mail

Após o cadastro, o Supabase envia um e-mail com link de confirmação. O link expira em **1 hora**.

Se o usuário clicar em um link expirado, o callback controller detecta o erro retornado pelo Supabase e redireciona para `/auth/link-expired`. Nessa página o usuário informa o e-mail e solicita um novo link — o reenvio usa o endpoint `POST /api/public/auth/resend-confirmation` (`supabase.auth.resend({ type: 'signup', email })`).

#### Constraint de `account_type`

A coluna `account_type` só aceita os valores `'CPF'` ou `'CNPJ'` (constraint `enterprise_account_type_check`). Tentativas de inserir outro valor resultam em erro de violação de constraint no banco.

---

### Orquestração de Análise IA

O Gateway é responsável por validar, filtrar e agrupar os dados antes de chamar o IA Analyze, e por persistir os resultados retornados. As regras internas do serviço (sentimentos, keywords, normalização) estão na seção [IA Analyze](#ia-analyze) abaixo.

#### Requisitos para Executar

A análise só é executada se a empresa tiver dados de contexto preenchidos em `collecting_data_enterprise`. A função `hasRequiredEnterpriseInfoForAnalysis` valida isso antes de qualquer chamada ao IA Analyze.

**Campos considerados:**
- `company_objective`
- `analytics_goal`
- `business_summary`
- `main_products_or_services` (ao menos 1 item)

**Se não atender:** erro `422 collecting_data_required_for_analysis`.

---

#### Deduplicação de Feedbacks

Antes de enviar ao IA Analyze, o Gateway busca todos os `feedback_id` já presentes em `feedback_analysis`. Feedbacks já analisados são **removidos do batch** para evitar reprocessamento.

---

#### Limite por Execução

```
limit = Math.min(options.limit ?? 50, 100)
```

- **Padrão:** 50 feedbacks por execução
- **Máximo:** 100 feedbacks por execução
- **Mínimo obrigatório:** `MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS = 5`

Se após filtragem o total ficar abaixo de 5: erro `422 insufficient_feedbacks_for_analysis`.

---

#### Batching por Escopo

Os feedbacks são agrupados pela função `buildAnalysisBatches`:

- Um batch para escopo `COMPANY` (sem `catalog_item_id`)
- Um batch por par `(scope_type, catalog_item_id)` para itens de catálogo

Cada batch é enviado **separadamente** ao provedor LLM externo para manter o contexto coerente por escopo.

---

#### Persistência de Resultados

| O que persiste | Tabela | Operação |
|---|---|---|
| Análise por feedback | `feedback_analysis` | `INSERT` |
| Insights globais por escopo | `feedback_insights_report` | `UPSERT` (chave: `enterprise_id + scope_type + catalog_item_id`) |

---

### Catálogo

#### Validação de Perguntas

```
20 ≤ comprimento da pergunta ≤ 150 caracteres
```

Perguntas fora desse intervalo são rejeitadas pela action `actionFeedbackSettings`.

#### Itens de Catálogo

Itens são enviados como **JSON serializado** no campo do formulário (`FormData`). A action deserializa, valida a estrutura e repassa ao serviço.

#### Flags de Tipo

| Flag | Tipo Habilitado |
|---|---|
| `uses_company_products` | Produtos |
| `uses_company_services` | Serviços |
| `uses_company_departments` | Departamentos |

Desativar uma flag **não exclui** os itens cadastrados — apenas oculta o tipo da interface.

---

### Coleta via QR Code

#### Fingerprint Anti-Spam

A função de banco `generate_device_fingerprint` gera um hash único por dispositivo. A tabela `tracked_devices` registra envios por `(device_fingerprint, collection_point_id)`.

Um dispositivo que enviou feedback para o mesmo ponto de coleta no mesmo dia recebe **`409 Conflict`**.

#### Perguntas Dinâmicas — Snapshot

O campo `question_text_snapshot` salva o texto da pergunta **no momento da coleta**. Isso preserva o histórico mesmo que a pergunta seja editada ou excluída depois.

```typescript
interface IaAnalyzeDynamicAnswer {
  question_id: string;
  question_text_snapshot: string;  // texto imutável no histórico
  answer_value: 'PESSIMO' | 'RUIM' | 'MEDIANA' | 'BOA' | 'OTIMA';
  answer_score: number;
}
```

---

### Escopo de Insights

A coluna `scope_type` em `feedback_insights_report` aceita:

```
'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT'
```

- `COMPANY` + `catalog_item_id = null` → insight geral da empresa
- Qualquer outro + `catalog_item_id` → insight por item específico

O upsert usa chave composta `(enterprise_id, scope_type, catalog_item_id)`.

---

### Troubleshooting — API Gateway

| Erro | Regra Violada | Como Resolver |
|---|---|---|
| `422 collecting_data_required_for_analysis` | Empresa sem contexto de negócio | Preencha ao menos um dos campos: objetivo, meta analítica ou resumo |
| `422 insufficient_feedbacks_for_analysis` | Menos de 5 feedbacks após filtragem | Colete mais feedbacks ou remova filtros de escopo/item |
| `422` no catálogo | Pergunta com texto inválido | Ajuste o texto para entre 20 e 150 caracteres |
| `409` na coleta pública | Dispositivo já enviou feedback para este ponto hoje | Aguarde até o próximo dia ou use outro ponto de coleta |

---

## IA Analyze

### Autenticação Interna

**O quê:** toda requisição deve incluir `x-ia-analyze-token` com o valor exato de `IA_ANALYZE_INTERNAL_TOKEN`.

**Por quê:** o serviço não tem autenticação de usuário. O token garante que apenas o API Gateway — e não agentes externos — pode acionar análises.

**Como é validado:** `utils/isInternalRequestAuthorized.ts` compara o header com a variável de ambiente. Se inválido, retorna `401` imediatamente, antes de qualquer processamento.

---

### Processamento de Batches

#### Batches Vazios São Ignorados

Se um batch tiver `feedbacks = []` ou `feedbacks` não for um array, ele é **pulado silenciosamente**. O serviço não lança erro — apenas continua para o próximo batch.

#### Idempotência por Feedback ID

Os resultados são acumulados em um `Map<string, Analysis>`. Se o mesmo `feedback_id` aparecer em dois batches diferentes (situação anômala), apenas a última análise prevalece.

---

### Validação de Sentimentos

Só três valores são aceitos:

```
'positive' | 'neutral' | 'negative'
```

Um item analisado pelo Gemini é **descartado silenciosamente** se:
- `feedback_id` não for uma string
- `sentiment` não estiver nos três valores válidos
- `feedback_id` não existir no mapa de feedbacks do batch atual

> 📝 **Nota:** O descarte é silencioso por design — um sentimento inválido não deve interromper a análise dos demais feedbacks do batch.

---

### Extração de Keywords

#### Regras de Sanitização

Cada keyword sugerida pelo modelo passa por `sanitizeTermList`:

1. Deve ser uma string não-vazia após trim
2. Sua forma normalizada deve estar **contida** na mensagem normalizada do feedback
3. Não pode estar no conjunto de **termos proibidos**
4. Não pode ser duplicata

**Limite:** máximo de **6 keywords**.

#### Fallback

Se nenhuma keyword passar na sanitização, `tokenizeRelevantWords` extrai palavras diretamente da mensagem (sem stop words, mínimo **4 caracteres**). Retorna até **4 tokens**.

---

### Extração de Categorias

#### Regras de Sanitização

Mesmas regras de keywords, com:

**Limite:** máximo de **4 categorias**.

#### Fallback

Se nenhuma categoria for válida, retorna as **2 primeiras keywords** como fallback.

---

### Termos Proibidos

`buildForbiddenTerms` constrói um `Set<string>` com termos que nunca devem aparecer no resultado:

- **`STRUCTURED_ANSWER_LABELS`** — rótulos genéricos de respostas estruturadas fixos no código: `pessimo`, `ruim`, `mediana`, `boa`, `otima`
- **Respostas das perguntas dinâmicas** (`dynamic_answers[].answer_value`) — os valores que o cliente selecionou nas perguntas do formulário
- **Enunciados das perguntas dinâmicas** (`dynamic_answers[].question_text_snapshot`) — o texto das próprias perguntas (filtro anti-poluição)
- **Respostas das subperguntas** (`dynamic_subanswers[].answer_value`)
- **Enunciados das subperguntas** (`dynamic_subanswers[].subquestion_text_snapshot`)

**Por quê:** evita que as respostas estruturadas do formulário (ex: "boa", "ótima") e os enunciados das próprias perguntas (ex: "Como foi o atendimento?") apareçam como keywords ou categorias — garantindo que o resultado reflita apenas a voz espontânea do cliente na mensagem livre.

---

### Normalização de Texto

Antes de qualquer comparação, textos passam por `normalizeForComparison`:

1. Converte para minúsculas
2. Remove acentos (NFD + regex)
3. Remove pontuação e caracteres especiais
4. Colapsa espaços múltiplos

A comparação usa `isGroundedInMessage`, que opera em dois níveis:
1. Verifica se o termo normalizado está contido diretamente na mensagem normalizada (`includes()`)
2. Se não estiver, tokeniza tanto o termo quanto a mensagem e verifica se **pelo menos um token** do termo aparece na mensagem — tolerando categorias multipalavra parcialmente presentes no texto

Isso garante que termos como "tempo de espera" sejam aceitos mesmo que a mensagem diga "demorou muito", desde que "espera" ou outro token relevante esteja presente.

---

### Contexto de Batch (Global Insights)

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

> 📝 **Nota:** `analyzedCount` reflete o total de feedbacks **enviados** no batch — não o número de análises válidas retornadas. Um feedback com sentimento inválido é contado aqui, mas descartado no `analyses[]`.

---

### Tratamento de Erros do Provedor LLM

| Cenário | Tipo de Erro | Código Retornado |
|---|---|---|
| Falha HTTP (`IaApiClientError` com código `failed_ia_request`) | `IaAnalyzeServiceError` 502 | `failed_ia_request` |
| Qualquer outro erro (JSON inválido, timeout, etc.) | `IaAnalyzeServiceError` 502 | `invalid_ai_response` |

O controller captura e retorna o status e código ao API Gateway, que repassa ao frontend.

---

### Troubleshooting — IA Analyze

| Sintoma | Regra Violada | Diagnóstico |
|---|---|---|
| `analyses` retorna vazio para todos os feedbacks | Todos com sentimento inválido | Verifique se o prompt está retornando `positive`, `neutral` ou `negative` exatamente |
| Keywords e categorias sempre vazias | Termos não encontrados na mensagem | Verifique se `message` está sendo enviada corretamente no payload |
| `globalInsights` é sempre `null` | Provedor LLM não retornou insights | Pode ser batch muito pequeno; experimente com mais feedbacks |
| `502 invalid_ai_response` frequente | Resposta do provedor LLM não parseável | Verifique `extractJsonFromText.ts`; pode ser mudança no formato de saída do modelo |
