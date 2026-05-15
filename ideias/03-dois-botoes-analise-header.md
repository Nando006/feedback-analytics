# Ideia 03 - Botao Analisar feedbacks no header (sob demanda)

## Status
Proposta documentada e pronta para implementacao.

## Objetivo
Controlar custo de IA separando claramente as responsabilidades: atualizar visualizacao do relatorio sem reprocessar feedback bruto, e executar analise sob demanda somente para descricoes com qualidade.

## Contexto
A analise totalmente automatica a cada feedback pode elevar custos.
No fluxo desejado, o botao "Atualizar relatorio" permanece na pagina de relatorio, mas sem analisar feedback bruto e sem escrever em `feedback_analysis`.
A analise fica exclusiva no botao dedicado do header.

## Proposta
Manter o botao "Atualizar relatorio" somente na pagina de relatorio (sem mudanca de comportamento) e adicionar no header o botao:

1. Analisar feedbacks
- Executa analise sob demanda com foco em descricao de feedback bruto.
- Considera somente feedbacks cujo `feedback_analysis.description_quality = true`.
- Nao depende do botao "Atualizar relatorio" para processar IA.
- So fica disponivel quando:
  - houver feedbacks elegiveis com `description_quality = true`, e
  - houver no minimo 10 feedbacks aptos para analise.

## Regra de produto
- "Atualizar relatorio" continua na pagina de relatorio, apenas para atualizar a visualizacao do relatorio.
- "Atualizar relatorio" nao analisa feedback bruto e nao grava em `feedback_analysis`.
- "Analisar feedbacks" e o botao de processamento de IA sob demanda.
- O botao "Analisar feedbacks" deve ficar desabilitado/oculto quando nao atingir os criterios minimos.
- Exibir mensagem clara quando bloqueado:
  - "Necessario no minimo 10 feedbacks com descricao de qualidade para analisar."

## Beneficios esperados
- Controle de custo (sem analise automatica continua).
- Aumenta precisao ao usar somente descricoes realmente uteis (`description_quality = true`).
- Experiencia simples: analisar somente quando fizer sentido de negocio.
- Maior previsibilidade de consumo e tempo de execucao.

## Fluxo funcional sugerido
1. Usuario escolhe escopo e periodo.
2. Sistema verifica quantidade de feedbacks elegiveis no recorte com `description_quality = true`.
3. Se houver menos de 10:
- botao "Analisar feedbacks" fica indisponivel.
- mostrar aviso de minimo necessario.
4. Se houver 10 ou mais:
- botao "Analisar feedbacks" fica disponivel.
5. Ao clicar em "Analisar feedbacks":
- buscar descricoes dos feedbacks brutos elegiveis.
- enviar para IA.
- persistir resultado em `feedback_analysis` (ou estrutura de saida definida para esta etapa).
6. Usuario clica em "Atualizar relatorio" para refletir no dashboard os dados ja analisados.

## Regras tecnicas sugeridas
1. Parametro de intencao para acao/API:
- intent=analyze_feedbacks

2. Filtro de elegibilidade:
- somente feedback com `description_quality = true`.
- aplicar minimo de 10 feedbacks elegiveis antes de disparar IA.

3. Persistencia:
- gravar resultado da execucao sob demanda em `feedback_analysis` (seguindo regras do modelo atual).

4. Telemetria minima:
- total de feedbacks elegiveis
- total processado
- duracao
- status final

## UX recomendada
- Manter "Atualizar relatorio" no lugar atual da pagina de relatorio.
- Exibir "Analisar feedbacks" no header com contador de elegiveis (ex.: "Analisar feedbacks (12)").
- Se abaixo de 10, exibir estado desabilitado com texto de ajuda.
- Exibir loading e feedback de sucesso/erro apos execucao.

## MVP de implementacao
1. UI
- adicionar botao "Analisar feedbacks" no header de insights.

2. Frontend action
- enviar `intent=analyze_feedbacks`.

3. Backend service
- filtrar feedbacks no recorte com `description_quality = true`.
- validar minimo de 10.
- analisar e persistir em `feedback_analysis`.

4. Mensageria UX
- feedback claro de bloqueio por minimo.
- feedback de sucesso com quantidade analisada.

5. Testes
- validar habilitacao/desabilitacao do botao.
- validar bloqueio com menos de 10.
- validar processamento apenas de feedbacks elegiveis (`description_quality = true`).
- validar persistencia em `feedback_analysis`.

## Criterios de aceite
- "Atualizar relatorio" apenas atualiza a visualizacao e nao processa IA.
- "Analisar feedbacks" so habilita com 10+ feedbacks elegiveis (`description_quality = true`).
- Execucao analisa apenas descricoes dos feedbacks elegiveis do recorte.
- Resultado e salvo em `feedback_analysis`.
- Sem regressao no fluxo atual de relatorio.

## Observacao
Essa ideia complementa:
- Ideia 01 (description_quality)
- Ideia 02 (analise por periodo com reanalise de precisao)
