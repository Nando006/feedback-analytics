# Ideia 02 - Analise por periodo com reanalise de precisao

## Status
Proposta documentada e pronta para implementacao.

## Objetivo
Permitir analise por periodo personalizado com alta precisao para responder:
- quais pontos estao ruins
- quais pontos estao bons
- onde melhorar
- como melhorar

## Contexto
No direcionamento atual, o processamento de IA deve acontecer somente no botao "Analisar feedbacks".
O botao "Atualizar relatorio" deve apenas refletir dados ja analisados, sem processar feedback bruto.

## Problema de negocio
Quando o cliente seleciona um periodo personalizado, ele espera um diagnostico forte e concreto daquele recorte.
Sem um fluxo dedicado por periodo com foco em qualidade, o relatorio pode ficar generico e pouco acionavel.

## Proposta (fluxo por periodo)
Ao executar analise por periodo personalizado no botao "Analisar feedbacks":
1. Buscar feedbacks do periodo e escopo selecionado.
2. Filtrar apenas os feedbacks elegiveis com `description_quality = true`.
3. Validar minimo de 10 feedbacks elegiveis.
4. Enviar para IA somente as descricoes brutas elegiveis.
5. Persistir resultado em `feedback_analysis` (conforme modelo vigente).
6. O botao "Atualizar relatorio" apenas atualiza a visualizacao com os dados ja analisados.

## Resultado esperado
- Diagnostico mais forte no periodo personalizado.
- Maior concretude para identificar causa raiz.
- Recomendações mais acionaveis para melhoria operacional.

## Regras de uso recomendadas
1. Executar analise por periodo somente quando:
- periodo for personalizado, e
- houver volume minimo de feedbacks elegiveis (`description_quality = true`).

2. Definir limite maximo de processamento (ex.: top 100 descricoes detalhadas) para controlar custo e latencia.

3. Priorizar feedbacks mais recentes no recorte quando exceder o limite.

## Decisao de arquitetura
### O que persiste em feedback_analysis
- Analise por feedback (sentiment, categories, keywords, description_quality).

### O que nao deve sobrescrever globalmente
- A sintese final do periodo quando for apenas visao de relatorio.

### Onde salvar a sintese do periodo
- Em estrutura de relatorio por contexto/periodo (ex.: insights report com filtro temporal), evitando alterar historico global sem controle.

## Beneficios
- Mantem controle de custo (analise apenas sob demanda).
- Eleva a qualidade do diagnostico por periodo usando descricoes uteis.
- Usa o melhor sinal textual disponivel (descricoes detalhadas).

## Riscos e mitigacoes
1. Custo extra de IA:
- Mitigar com limite de volume e gatilhos de execucao.

2. Latencia maior:
- Mitigar com processamento em lote e limite de itens.

3. Inconsistencia de interpretacao entre versoes de prompt:
- Mitigar com versionamento de prompt no relatorio e opcao de reprocessamento total sob demanda.

## MVP tecnico (fases)
1. Fase 1 - Filtro temporal
- Adicionar `from` e `to` no fluxo de analise e leitura de insights.

2. Fase 2 - Qualidade de descricao
- Disponibilizar `description_quality` em `feedback_analysis`.

3. Fase 3 - Analise sob demanda por qualidade
- Implementar pipeline no botao "Analisar feedbacks" para processar somente `description_quality = true`.

4. Fase 4 - Atualizacao de visualizacao
- Garantir que "Atualizar relatorio" nao processe IA e apenas leia dados analisados.

## Criterios de aceite
- Periodo personalizado analisa somente feedbacks elegiveis (`description_quality = true`).
- Bloqueio correto quando houver menos de 10 feedbacks elegiveis.
- "Atualizar relatorio" nao processa feedback bruto nem aciona IA.
- Relatorio final aponta pontos bons, ruins e recomenda melhorias de forma mais concreta.
- Sem regressao no fluxo atual de visualizacao do relatorio.

## Indicadores para medir ganho
- Aumento da taxa de recomendacoes consideradas acionaveis pelo usuario.
- Reducao de respostas genericas no relatorio final.
- Melhoria de satisfacao do usuario com o insight por periodo.
