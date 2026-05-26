# UC-09: Visualização do Dashboard

| Campo | Valor |
|---|---|
| **Ator** | Gestor |
| **Objetivo** | Ter uma visão geral e atualizada da situação dos feedbacks da empresa |
| **Gatilho** | Gestor faz login ou navega para o dashboard |

---

## Fluxo Principal (Caminho Feliz)

1. O gestor acessa o dashboard.
2. O sistema carrega em paralelo as estatísticas e os últimos feedbacks da empresa.
3. O dashboard exibe:
   - **4 cards de métricas:** feedbacks recebidos (total), média de satisfação (em estrelas), feedbacks positivos (notas 4★ e 5★) e feedbacks críticos (notas 1★ e 2★).
   - **Gráfico de distribuição de avaliações** por nota.
   - **Últimos 5 feedbacks recebidos**, cada um com: tipo de ponto de coleta, nota em estrelas, data, mensagem truncada, até 3 respostas às perguntas dinâmicas e nome do cliente (quando identificado).
   - **Estratégia de coleta:** exibe os dados de contexto do negócio — objetivo da empresa, objetivo analítico, resumo do negócio e lista de produtos/serviços monitorados (conforme preenchido no UC-08 e UC-07).
   - **Radar de satisfação:** gráfico baseado na proporção de feedbacks positivos, neutros e negativos.
4. Ao acessar o dashboard logo após o login, o sistema exibe um toast de boas-vindas.

---

## Exceções

| Situação | O que o sistema faz |
|---|---|
| Empresa sem nenhum feedback coletado ainda | Exibe o dashboard com todos os contadores zerados, gráficos em estado vazio e a lista de feedbacks com mensagem "Nenhum feedback foi recebido até o momento." |
| Erro ao carregar estatísticas ou lista de feedbacks | Exibe mensagem de erro inline no topo do dashboard — a página permanece acessível, não há redirecionamento |
| Sessão expirada durante a navegação | Redireciona automaticamente para `/login` |

---

## Base para Teste E2E

> Os testes E2E já estão implementados no Playwright ([uc-09-dashboard.spec.ts](file:///C:/Users/Fernando/Repositorios/feedback-analytics/apps/web/e2e/uc-09-dashboard.spec.ts)).
> Cada cenário abaixo possui a sua respectiva classificação e estratégia de execução mapeada no [Plano de Teste Estratégico](../testes/plano-estrategico.md).

**Cenários a cobrir:**

- **[CT-UC09-01]** ✅ *Coberto E2E* - Caminho feliz: gestor autenticado acessa o dashboard e visualiza os 4 cards de métricas, gráficos e os últimos 5 feedbacks com dados reais.
- **[CT-UC09-02]** ✅ *Coberto E2E* - Caminho feliz — toast de login: acessar o dashboard com `?login=success` na URL deve exibir o toast de boas-vindas e remover o parâmetro da URL.
- **[CT-UC09-03]** ✅ *Coberto E2E* - Exceção — sem feedbacks: empresa sem feedbacks deve exibir o dashboard com zeros e a mensagem de lista vazia, sem erros.
- **[CT-UC09-04]** ❌ *Cenário não coberto* - Exceção — erro de carregamento: simular falha na API de estatísticas deve exibir a mensagem de erro inline no topo, sem redirecionar.
- **[CT-UC09-05]** ✅ *Coberto E2E* - Exceção — sessão expirada: acessar o dashboard com sessão inválida deve redirecionar para `/login`.
