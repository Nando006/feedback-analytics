# IA Analyze — Visão Geral

## O Que É

O `ia-analyze` é um **microserviço independente** responsável por uma única coisa: receber lotes de feedbacks, chamar o **Google Gemini** e retornar análises estruturadas.

Ele não tem banco de dados, não autentica usuários e não conhece a lógica de negócio do sistema. É um processador puro de texto.

## Por Que É um Serviço Separado

Separar a IA do API Gateway traz três vantagens práticas:

1. **Escalabilidade independente** — o serviço de IA pode ser escalado (ou desligado) sem afetar o restante do sistema
2. **Substituição de modelo** — trocar Gemini por outro modelo exige mudança apenas neste serviço, sem tocar no Gateway
3. **Isolamento de falhas** — uma falha no Gemini não derruba o Gateway inteiro

## Como Funciona

1. O API Gateway envia `POST /ia-analyze/analyze` com `{ enterprise_context, batches[] }`
2. O serviço valida o **token interno** (`X-Internal-Token`) — rejeita qualquer requisição não autorizada
3. Para cada batch, chama o Gemini com um prompt estruturado por escopo
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
X-Internal-Token: <INTERNAL_SERVICE_TOKEN>
```

O valor deve ser idêntico ao configurado no API Gateway. Requisições sem o token correto recebem `401 unauthorized_internal_request` imediatamente.

> ⚠️ **Aviso:** Nunca exponha a URL do IA Analyze publicamente. Ela deve ser acessível apenas pelo API Gateway na rede interna.

## Tecnologias

- **Runtime:** Node.js 20+ com TypeScript (ESM)
- **Framework:** Express
- **Modelo de IA:** Google Gemini via API REST
- **Testes:** Vitest
- **Deploy:** Vercel (serverless)

## Veja Também

- [Endpoints](./endpoints.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [Regras de Negócio](./regras-negocio.md)
- [Funcionalidade — Análise IA](../../funcionalidades/insights-ia.md)
