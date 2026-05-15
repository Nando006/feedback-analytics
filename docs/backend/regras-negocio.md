# Backend — Regras de Negócio (API Gateway)

## Autenticação e Isolamento de Dados

**Como funciona:** todo endpoint em `/protected/*` passa pelo middleware `requireAuth`, que valida o JWT via Supabase e injeta `req.user` e `req.supabase` na request.

**Regra de isolamento:** o `userId` extraído do JWT é usado em todas as queries. Nenhum endpoint retorna dados de outra empresa — o isolamento é garantido em duas camadas: no nível de **repositório** (filtros no código) e diretamente no banco de dados via **RLS (Row Level Security)** do Supabase.

> ⚠️ **Aviso:** Nunca passe `userId` como parâmetro de query string ou body em endpoints protegidos. O Gateway extrai o ID do JWT, não do payload da requisição.

---

## Análise IA

### Requisitos para Executar

A análise só é executada se a empresa tiver dados de contexto preenchidos em `collecting_data_enterprise`. A função `hasRequiredEnterpriseInfoForAnalysis` valida isso antes de qualquer chamada ao IA Analyze.

**Campos considerados:**
- `company_objective`
- `analytics_goal`
- `business_summary`
- `main_products_or_services` (ao menos 1 item)

**Se não atender:** erro `422 collecting_data_required_for_analysis`.

---

### Deduplicação de Feedbacks

Antes de enviar ao IA Analyze, o Gateway busca todos os `feedback_id` já presentes em `feedback_analysis`. Feedbacks já analisados são **removidos do batch** para evitar reprocessamento.

---

### Limite por Execução

```
limit = Math.min(options.limit ?? 50, 100)
```

- **Padrão:** 50 feedbacks por execução
- **Máximo:** 100 feedbacks por execução
- **Mínimo obrigatório:** `MIN_FEEDBACKS_FOR_RELEVANT_ANALYSIS = 5`

Se após filtragem o total ficar abaixo de 5: erro `422 insufficient_feedbacks_for_analysis`.

---

### Batching por Escopo

Os feedbacks são agrupados pela função `buildAnalysisBatches`:

- Um batch para escopo `COMPANY` (sem `catalog_item_id`)
- Um batch por par `(scope_type, catalog_item_id)` para itens de catálogo

Cada batch é enviado **separadamente** ao provedor LLM externo para manter o contexto coerente por escopo.

---

### Persistência de Resultados

| O que persiste | Tabela | Operação |
|---|---|---|
| Análise por feedback | `feedback_analysis` | `INSERT` |
| Insights globais por escopo | `feedback_insights_report` | `UPSERT` (chave: `enterprise_id + scope_type + catalog_item_id`) |

---

## Catálogo

### Validação de Perguntas

```
20 ≤ comprimento da pergunta ≤ 150 caracteres
```

Perguntas fora desse intervalo são rejeitadas pela action `actionFeedbackSettings`.

### Itens de Catálogo

Itens são enviados como **JSON serializado** no campo do formulário (`FormData`). A action deserializa, valida a estrutura e repassa ao serviço.

### Flags de Tipo

| Flag | Tipo Habilitado |
|---|---|
| `uses_company_products` | Produtos |
| `uses_company_services` | Serviços |
| `uses_company_departments` | Departamentos |

Desativar uma flag **não exclui** os itens cadastrados — apenas oculta o tipo da interface.

---

## Coleta via QR Code

### Fingerprint Anti-Spam

A função de banco `generate_device_fingerprint` gera um hash único por dispositivo. A tabela `tracked_devices` registra envios por `(device_fingerprint, collection_point_id)`.

Um dispositivo que enviou feedback para o mesmo ponto de coleta no mesmo dia recebe **`409 Conflict`**.

### Perguntas Dinâmicas — Snapshot

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

## Escopo de Insights

A coluna `scope_type` em `feedback_insights_report` aceita:

```
'COMPANY' | 'PRODUCT' | 'SERVICE' | 'DEPARTMENT'
```

- `COMPANY` + `catalog_item_id = null` → insight geral da empresa
- Qualquer outro + `catalog_item_id` → insight por item específico

O upsert usa chave composta `(enterprise_id, scope_type, catalog_item_id)`.

---

## Troubleshooting

| Erro | Regra Violada | Como Resolver |
|---|---|---|
| `422 collecting_data_required_for_analysis` | Empresa sem contexto de negócio | Preencha ao menos um dos campos: objetivo, meta analítica ou resumo |
| `422 insufficient_feedbacks_for_analysis` | Menos de 5 feedbacks após filtragem | Colete mais feedbacks ou remova filtros de escopo/item |
| `422` no catálogo | Pergunta com texto inválido | Ajuste o texto para entre 20 e 150 caracteres |
| `409` na coleta pública | Dispositivo já enviou feedback para este ponto hoje | Aguarde até o próximo dia ou use outro ponto de coleta |
