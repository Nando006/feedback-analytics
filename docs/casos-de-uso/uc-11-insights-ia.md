# UC-11: Disparo e Visualização de Insights IA

| Campo | Valor |
|---|---|
| **Ator** | Gestor |
| **Objetivo** | Processar os feedbacks coletados com IA e visualizar o relatório de insights, análise emocional e estatísticas |
| **Gatilho** | Gestor acessa o painel de insights |

---

## Fluxo Principal (Caminho Feliz)

1. O gestor acessa o painel de insights.
2. O sistema carrega o relatório existente (se houver) e exibe o clima emocional atual.
3. O gestor seleciona o **escopo da análise**: Empresa (padrão), Produto, Serviço ou Departamento. Ao selecionar um escopo diferente de Empresa, deve também escolher o item de catálogo correspondente.
4. O gestor executa as análises em duas etapas independentes, por meio dos controles no topo da página:
   - **"Analisar feedbacks"** — processa os feedbacks brutos e classifica sentimentos (positivo, neutro, negativo).
   - **"Gerar insights"** — envia os feedbacks analisados para a IA gerar o resumo estratégico e as recomendações.
5. Após cada operação concluir, o relatório é atualizado automaticamente na tela.
6. O gestor visualiza o relatório com:
   - **Mood (clima emocional):** label (Positivo / Neutro / Atenção) e percentuais de sentimento.
   - **Resumo estratégico:** texto gerado pela IA.
   - **Recomendações:** lista de ações sugeridas pela IA.
7. O gestor pode navegar para as outras abas:
   - **Análise Emocional:** termômetro de sentimento e clusters de feedbacks (momentos que encantam, pontos de dor, feedbacks ambivalentes).
   - **Estatísticas:** percentuais de sentimento e temas principais identificados.

> **Pré-condição para análise:** os três campos de contexto devem estar preenchidos em UC-08 — Objetivo da Empresa, Objetivo Analítico e Resumo do Negócio. Se algum estiver em branco, os botões ficam desabilitados e o sistema exibe mensagem orientando o gestor a completar as configurações.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Contexto de negócio incompleto (qualquer um dos 3 campos em branco) | Botões de análise ficam desabilitados; mensagem com link direto para a tela de configuração de coleta |
| Escopo não-Empresa selecionado sem escolher item de catálogo | Botões ficam desabilitados até o item ser selecionado |
| Menos de 10 feedbacks disponíveis para análise | Retorna mensagem "É necessário no mínimo 10 feedbacks" — a ação é bloqueada |
| Erro ao carregar o relatório existente | Exibe popup de erro dismissível no canto da tela — o resto da página permanece acessível |
| Erro ao executar análise ou gerar insights | A ação retorna a mensagem de erro — o relatório anterior (se existir) permanece visível |
| Análise Emocional ou Estatísticas sem dados | Exibe empty state em cada aba indicando que não há feedbacks analisados ainda |

---

## Base para Teste E2E

> Os testes E2E estão implementados no Playwright ([uc-11-insights-ia.spec.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/apps/web/e2e/uc-11-insights-ia.spec.ts)). O spec contém dois smokes de carregamento da página de relatório e um teste do botão de regenerar (condicional, com `test.skip()` quando o botão não está visível e com a chamada à API de IA mockada para não consumir créditos). Cada cenário abaixo possui a sua respectiva classificação e estratégia de execução mapeada no [Plano de Teste Estratégico](../testes/plano-estrategico.md).

**Cenários a cobrir:**

- **[CT-UC11-01]** ✅ *Coberto E2E (smoke)* - Carregamento do relatório: a página `/user/insights/reports` carrega exibindo o sumário/insights ou o estado vazio. (Spec: `[CT-UC11-01] Página de relatório de insights carrega com sumário ou estado vazio`.) **Não** dispara a análise.
- **[CT-UC11-02]** ✅ *Coberto E2E (smoke)* - Sentimentos e keywords: a página de insights exibe a análise de sentimentos e palavras-chave (ou o estado vazio). (Spec: `[CT-UC11-02] Página de insights exibe análise de sentimentos e keywords`.)
- **[CT-UC11-05]** ✅ *Coberto E2E (skip condicional)* - Regenerar insights: clicar no botão de regenerar/gerar insights deve solicitar nova análise (chamada de IA mockada) e exibir feedback de processamento. Contém `test.skip()` quando o botão não está visível. (Spec: `[CT-UC11-05] Botão de regenerar insights solicita nova análise`.)
- **[CT-UC11-03]** 📝 *Planejado / não implementado* - Caminho feliz — analisar feedbacks: gestor com contexto preenchido e mínimo de 10 feedbacks clica em "Analisar feedbacks" — deve processar e atualizar o clima emocional automaticamente.
- **[CT-UC11-04]** 📝 *Planejado / não implementado* - Caminho feliz — gerar insights: após análise, clicar em "Gerar insights" deve atualizar o relatório com resumo e recomendações da IA.
- **[CT-UC11-06]** 📝 *Planejado / não implementado* - Caminho feliz — escopo por produto: selecionar escopo "Produto" e um item de catálogo, gerar análise e confirmar que o relatório reflete aquele item específico.
- **[CT-UC11-07]** 🔵 *Unidade já atende* - Caminho feliz — navegação entre abas: após gerar relatório, navegar para "Análise Emocional" e "Estatísticas" deve exibir os dados correspondentes.
- **[CT-UC11-08]** 📝 *Planejado / não implementado* - Exceção — contexto incompleto: acessar insights sem preencher todos os campos de contexto deve exibir os botões desabilitados e a mensagem de bloqueio com link para configuração.
- **[CT-UC11-09]** 📝 *Planejado / não implementado* - Exceção — item não selecionado: selecionar escopo "Produto" sem escolher item deve manter os botões desabilitados.
- **[CT-UC11-10]** 📝 *Planejado / não implementado* - Exceção — volume insuficiente: tentar analisar com menos de 10 feedbacks deve retornar a mensagem "É necessário no mínimo 10 feedbacks".
