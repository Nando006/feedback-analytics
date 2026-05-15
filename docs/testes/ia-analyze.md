# Testes — Microserviço IA (`services/ia-analyze`)

## Status Atual

**Sem cobertura.** O `ia-analyze` não possui testes.

O serviço é uma API Express em Node.js puro — sem DOM, sem Vite, sem React. O Vitest foi removido por não fazer sentido neste contexto: ele é o framework de testes do frontend web, onde o Vite já está presente como bundler. Para um serviço Node.js independente, o Vitest adiciona uma dependência sem justificativa técnica.

---

## O Que Não Está Sendo Testado

| Módulo | Responsabilidade |
|---|---|
| `sentimentAnalysis.service.ts` | Valida se o sentimento retornado pelo LLM é aceito |
| `iaAnalyzePromptBuilders.ts` | Monta o prompt enviado ao LLM por escopo |
| `keywordExtraction.service.ts` | Extrai e sanitiza palavras-chave da resposta |
| `categorization.service.ts` | Extrai e sanitiza categorias da resposta |
| `globalInsights.service.ts` | Monta contexto de insights por batch |
| `iaAnalyze.service.ts` | Orquestrador do fluxo completo |

---

## Como Cobrir

Para um serviço Node.js ESM com TypeScript, as opções mais adequadas são:

### Jest com ts-jest

Opção mais consolidada e com maior ecossistema de mocks para Node.js.

```bash
npm install -D jest ts-jest @types/jest
```

```ts
// jest.config.ts
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
};
```

### Node Test Runner (nativo)

Disponível no Node 18+ sem dependências externas. Adequado para testes simples de funções puras.

```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidSentiment } from '../src/services/sentimentAnalysis.service.js';

describe('isValidSentiment', () => {
  it('aceita sentimentos válidos', () => {
    assert.equal(isValidSentiment('positive'), true);
  });
});
```

---

## Prioridade de Cobertura

Se os testes forem implementados, esta é a ordem de valor:

| Prioridade | O que testar | Motivo |
|---|---|---|
| 1 | `isValidSentiment` e `canProcessAnalyzedItem` | Guardiões que descartam dados inválidos do LLM |
| 2 | `buildIaPromptByScope` | Contrato crítico entre sistema e modelo de IA |
| 3 | `keywordExtraction` e `categorization` | Sanitização de dados antes de salvar |
| 4 | `iaAnalyze.service.ts` (orquestrador) | Requer mock do cliente LLM — mais complexo |

---

## Veja Também

- [Visão Geral dos Testes](./visao-geral.md)
- [Frontend](./web.md)
- [Backend](./api-gateway.md)
- [Visão Geral do Serviço IA](../servicos/ia-analyze/visao-geral.md)
