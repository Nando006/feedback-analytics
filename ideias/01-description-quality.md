# Ideia 01 - Campo description_quality (boolean | null)

## Status
Proposta documentada e pronta para implementacao.

## Contexto
Hoje a IA analisa os feedbacks e gera sentimento, categorias e keywords.
Mesmo assim, parte dos textos e muito generica e gera pouco valor pratico para diagnostico.

## Problema
Sem um sinal de qualidade da descricao, o relatorio mistura:
- feedbacks com texto acionavel (detalhado e especifico)
- feedbacks com texto generico (pouco util para causa raiz)

Isso reduz a precisao das recomendacoes.

## Proposta
Adicionar na tabela `feedback_analysis` o campo:
- `description_quality` (`boolean | null`)

Regra:
- `true`: descricao com qualidade (detalhada e acionavel)
- `false`: descricao sem qualidade (generica, pouco acionavel)
- `null`: ainda nao analisado

## Criterios de classificacao (IA)
### description_quality = true
Usar `true` quando a mensagem trouxer pelo menos parte destes sinais:
- contexto especifico (onde/quando/qual etapa)
- problema ou ponto positivo concreto
- impacto percebido
- detalhe que permita acao pratica

Exemplos:
- "No caixa da unidade X, esperei 25 minutos e faltou orientacao."
- "O produto chegou com embalagem amassada e lacre rompido."

### description_quality = false
Usar `false` quando a mensagem for curta/generica sem detalhe acionavel.

Exemplos:
- "Muito bom"
- "Horrivel"
- "Gostei"

## Como isso melhora o produto
- Aumenta a qualidade do diagnostico (foco em texto realmente util).
- Permite filtrar feedbacks mais relevantes para apontar o que esta ruim e o que esta bom.
- Mantem feedbacks genericos para tendencia de sentimento, sem contaminar recomendacoes profundas.

## Impacto tecnico esperado
1. Banco
- Adicionar coluna `description_quality boolean null` em `feedback_analysis`.
- Backfill opcional para historico (pode ficar `null` inicialmente).

2. Pipeline IA
- Incluir regra no prompt para retornar `description_quality` por feedback.
- Validar/sanitizar valor antes de persistir.

3. Persistencia
- Salvar `description_quality` junto com `feedback_id`, `sentiment`, `categories`, `keywords`.

4. Relatorios
- Priorizar feedbacks com `description_quality = true` para diagnostico e recomendacoes.
- Exibir filtro opcional: "Somente descricoes com qualidade".

## Regras de seguranca de dados
- `null` representa "nao analisado" (nao confundir com baixa qualidade).
- Nunca inferir `true/false` fora do fluxo de IA sem regra explicita.
- Se resposta da IA vier invalida, persistir `null` e seguir fluxo com log.

## Plano de implementacao (MVP)
1. Migration SQL para adicionar coluna `description_quality`.
2. Atualizar contrato/tipos de `feedback_analysis` no backend.
3. Atualizar prompt da IA com regra objetiva de classificacao.
4. Atualizar `iaStudioService` para validar e salvar o novo campo.
5. Atualizar leitura de relatorio para usar esse sinal como prioridade.
6. Adicionar testes unitarios:
- parse/validacao do campo
- persistencia
- filtro/priorizacao no relatorio

## Criterios de aceite
- Todo feedback novo analisado pela IA grava `description_quality` como `true` ou `false`.
- Feedback nao analisado permanece `null`.
- Relatorio mostra melhora de relevancia ao priorizar `description_quality = true`.
- Sem regressao em sentiment/categories/keywords.

## Observacao
Recomendacao para fase futura: adicionar `description_quality_confidence` (0-1) se houver necessidade de ranking mais fino.
