# IA Analyze — Arquitetura e Estrutura

## Organização em Camadas

O serviço segue uma arquitetura em camadas simples, sem acesso a banco de dados:

```
Route → Controller → Service (orquestrador) → Serviços de Domínio → Provider (Gemini)
```

```mermaid
graph TB
    subgraph HTTP["Camada HTTP"]
        R[POST /ia-analyze/analyze]
        H[GET /health]
    end

    subgraph Controller["Controller"]
        CTRL[analyzeController\nValida token + payload + delega]
    end

    subgraph Services["Serviços de Domínio"]
        MAIN[iaAnalyze.service.ts\nOrquestrador]
        SENT[sentimentAnalysis.service.ts\nValida sentimentos]
        KW[keywordExtraction.service.ts\nExtrai e sanitiza keywords]
        CAT[categorization.service.ts\nExtrai e sanitiza categorias]
        GI[globalInsights.service.ts\nMonta contexto por batch]
    end

    subgraph Lib["Biblioteca de Processamento"]
        TP[termProcessing.ts\nsanitizeTermList · buildForbiddenTerms · tokenize]
        NORM[normalizeForComparison.ts]
    end

    subgraph Provider["Provider"]
        PROV[gemini.provider.ts\nCliente HTTP Gemini]
        GM[Google Gemini API]
    end

    R --> CTRL --> MAIN
    MAIN --> SENT
    MAIN --> KW
    MAIN --> CAT
    MAIN --> GI
    MAIN --> PROV --> GM
    KW --> TP --> NORM
    CAT --> TP
```

---

## Fluxo de Processamento por Batch

```mermaid
sequenceDiagram
    participant GW as API Gateway
    participant CTRL as Controller
    participant SVC as iaAnalyze.service
    participant GM as Gemini API
    participant KW as keywordExtraction
    participant CAT as categorization

    GW->>CTRL: POST {enterprise_context, batches[]}
    CTRL->>CTRL: isInternalRequestAuthorized()
    CTRL->>CTRL: isValidRemotePayload()
    CTRL->>SVC: runIaAnalyzeService(request)

    loop Para cada batch
        SVC->>GM: analyzeBatch({scopeType, context, feedbacks})
        GM-->>SVC: {feedbacks[], global_insights}

        loop Para cada feedback analisado
            SVC->>SVC: canProcessAnalyzedItem() — valida sentimento
            SVC->>KW: extractKeywords(feedback, rawKeywords)
            KW-->>SVC: string[] sanitizado
            SVC->>CAT: extractCategories(feedback, rawCategories, keywords)
            CAT-->>SVC: string[] sanitizado
            SVC->>SVC: Acumula em Map feedback_id → análise
        end
    end

    SVC-->>CTRL: {analyses[], contexts[]}
    CTRL-->>GW: 200 JSON
```

---

## `termProcessing.ts` — Núcleo de Sanitização

Este módulo é o coração do processamento linguístico. Garante que o modelo não "alucine" termos que não existem no feedback original.

### `sanitizeTermList`

```typescript
sanitizeTermList({
  terms: string[],            // lista bruta do modelo (keywords ou categorias)
  messageNormalized: string,  // mensagem do feedback normalizada
  forbiddenTerms: Set<string>,// termos que não devem aparecer
  maxCount: number,           // limite de termos no resultado
}) → string[]
```

Garante que cada termo:
1. É uma string não-vazia
2. Aparece de alguma forma na mensagem original (filtra alucinações)
3. Não está na lista de termos proibidos
4. Não é duplicata

### `buildForbiddenTerms`

Constrói o `Set` de termos proibidos a partir do feedback:
- Tokens do nome da empresa
- Tokens do nome do item de catálogo
- Marcadores de sentimento em português (`positivo`, `negativo`, `neutro`, etc.)

### `tokenizeRelevantWords`

Quebra uma string em palavras relevantes removendo stop words e palavras com menos de 3 caracteres. Usado como **fallback de keywords** quando o modelo não retorna nenhuma keyword válida.

---

## Estrutura de Diretórios

```
services/ia-analyze/src/
├── controllers/
│   └── iaAnalyze.controller.ts         → Token + payload + resposta HTTP
├── services/
│   ├── iaAnalyze.service.ts            → Orquestrador principal
│   ├── sentimentAnalysis.service.ts    → Validação de sentimentos
│   ├── keywordExtraction.service.ts    → Extração com fallback
│   ├── categorization.service.ts       → Categorização com fallback
│   └── globalInsights.service.ts       → Contexto por batch
├── providers/
│   └── gemini.provider.ts              → Cliente HTTP Gemini + analyzeBatch
├── routes/
│   └── iaAnalyze.routes.ts             → /health + /ia-analyze/analyze
├── lib/
│   ├── termProcessing.ts               → sanitize, forbidden terms, tokenize
│   └── prompts/scopeInstructions.ts    → Instruções por escopo injetadas no prompt
├── validations/
│   └── iaAnalyze.validation.ts         → isValidRemotePayload
├── utils/
│   ├── extractJsonFromText.ts
│   ├── isInternalRequestAuthorized.ts
│   ├── isObject.ts
│   └── normalizeForComparison.ts
└── types/
    ├── sentimentAnalysis.types.ts
    └── termProcessing.types.ts
```

---

## Breaking Change — Reestruturação Completa

:::warning Breaking Change (homolog → main)
O serviço foi completamente reescrito nesta branch:

**Antes (main):** arquivo único `sentimentAnalysis.ts` de 40 linhas, sem estrutura de serviços.

**Depois (homolog):** 5 serviços separados, provider isolado, biblioteca de processamento de termos, rotas próprias com health check, validação separada e tipos em arquivos dedicados.

Qualquer integração que importe módulos internos do `ia-analyze` diretamente precisará ser atualizada para os novos caminhos.
:::
