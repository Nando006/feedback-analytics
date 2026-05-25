# IA Analyze — Visão Geral

## O Que É

O `ia-analyze` é um **microserviço independente** responsável por uma única coisa: receber lotes de feedbacks, chamar o **provedor LLM externo configurável** e retornar análises estruturadas.

Ele não tem banco de dados, não autentica usuários e não conhece a lógica de negócio do sistema. É um processador puro de texto.

## Por Que É um Serviço Separado

Separar a IA do API Gateway traz três vantagens práticas:

1. **Escalabilidade independente** — o serviço de IA pode ser escalado (ou desligado) sem afetar o restante do sistema
2. **Substituição de modelo** — trocar o provedor LLM exige mudança apenas neste serviço, sem tocar no Gateway
3. **Isolamento de falhas** — uma falha no provedor LLM não derruba o Gateway inteiro

## Como Funciona

1. O API Gateway envia `POST /internal/ia-analyze/analyze` com `{ enterprise_context, batches[] }`
2. O serviço valida o **token interno** (`x-ia-analyze-token`) — rejeita qualquer requisição não autorizada
3. Para cada batch, chama o provedor LLM com um prompt estruturado por escopo
4. Processa e **sanitiza** a resposta: valida sentimentos, extrai keywords e categorias, descarta alucinações
5. Retorna `{ analyses[], contexts[] }` ao Gateway

## Serviços Internos

O processamento é dividido em cinco serviços de domínio:

| Serviço | Responsabilidade |
|---|---|
| `iaAnalyze.service.ts` | Orquestrador — coordena o fluxo completo |
| `sentimentAnalysis.service.ts` | Valida se o sentimento retornado é aceito |
| `keywordExtraction.service.ts` | Extrai e sanitiza palavras-chave |
| `categorization.service.ts` | Extrai e sanitiza categorias |
| `globalInsights.service.ts` | Monta o contexto de insights por batch |

## Autenticação Interna

Toda requisição deve incluir o header:
```
x-ia-analyze-token: <IA_ANALYZE_INTERNAL_TOKEN>
```

O valor deve ser idêntico ao configurado no API Gateway via variável de ambiente `IA_ANALYZE_INTERNAL_TOKEN`. Requisições com token inválido recebem `401 unauthorized_internal_request`.

> **Nota:** o token é **opcional**. Se `IA_ANALYZE_INTERNAL_TOKEN` não estiver definido no ambiente, todas as requisições são aceitas — comportamento intencional para desenvolvimento local.

> ⚠️ **Aviso:** Nunca exponha a URL do IA Analyze publicamente. Ela deve ser acessível apenas pelo API Gateway na rede interna.

## Tecnologias

- **Runtime:** Node.js 20+ com TypeScript (ESM)
- **Framework:** Express
- **Modelo de IA:** Provedor LLM externo configurável via `GEMINI_API_KEY` (atualmente Google Gemini)
- **Testes:** Vitest
- **Deploy:** Vercel (serverless)

## Veja Também

- [Endpoints](./endpoints.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [Regras de Negócio](../../regras-negocio.md)
- [Funcionalidade — Painel de Insights](../../funcionalidades/painel-insights-ia.md)
