# 01 — Métricas por período + comparação entre intervalos

| Campo | Valor |
|---|---|
| **Status** | 🟡 Planejado |
| **Esforço estimado** | Médio |
| **Camadas afetadas** | Banco · API Gateway · Frontend (dashboard) |
| **Depende de** | Índice em `feedback.created_at` |

## Objetivo

O gestor precisa de duas capacidades novas no painel:

1. **Filtrar as métricas de um escopo por intervalo de período** — ver os números (total, média, distribuição, sentimento) de um recorte de tempo, e não só o histórico completo.
2. **Comparar dois intervalos** — por exemplo, "mês retrasado × mês passado" — numa visualização **intuitiva**, que mostre claramente a variação (subiu/caiu, em quanto).

## Como funciona hoje

O cálculo de métricas já existe e já é segmentável por **escopo** (empresa / produto / serviço / departamento), mas **não tem nenhuma noção de tempo**.

- **Endpoint:** `GET /api/protected/user/feedbacks/stats` → `getFeedbacksStatsController` em `backends/api-gateway/src/controllers/protected/feedbacks.controller.ts`.
  - Aceita os query params `scope_type` e `catalog_item_id` (resolve quais `collection_point` entram na conta).
  - Consulta a tabela `feedback` filtrando por `enterprise_id` (+ `collection_point_id` quando há escopo). **Não há filtro por `created_at`** — sempre considera todo o histórico.
  - Agrega em JavaScript: `totalFeedbacks`, `averageRating`, `ratingDistribution` (notas 1–5) e `sentimentBreakdown` (4–5 = positivo, 3 = neutro, 1–2 = negativo).
- **Frontend:**
  - `apps/web/src/services/serviceFeedbacks.ts` → `ServiceGetFeedbackStats` monta a query string.
  - `apps/web/src/routes/load/loadFeedbackStats.ts` e `apps/web/src/routes/loaders/loaderUserDashboard.ts` carregam o estado inicial (escopo `COMPANY`).
  - `apps/web/pages/user/dashboard.tsx` re-busca os stats quando o escopo muda, lendo `scope`/`catalogItemId` do contexto `apps/web/src/lib/context/insightsControls.tsx`.
  - Renderização: `SectionMetric`, `SectionEvaluationDistribution`, `SectionSatisfactionRadar` (em `apps/web/components/user/pages/dashboard/`). **Não existe nenhum seletor de data hoje.**
- **Banco:** a tabela `feedback` (`database/sql/tables/public.feedback.sql`) tem `created_at timestamp with time zone default now()`, mas **só há índice na PK (`id`) e na FK (`enterprise_id`)** — **não há índice em `created_at`**.

## Proposta

### Parte A — Filtro por intervalo
Adicionar dois parâmetros opcionais (`start_date`, `end_date`, em ISO) ao endpoint de stats e um seletor de período no dashboard. Quando preenchidos, as métricas refletem apenas os feedbacks daquele intervalo, mantendo o filtro de escopo já existente.

### Parte B — Comparação entre dois intervalos
Permitir escolher dois períodos (A e B) e exibir lado a lado, com indicadores de variação. Para "mês retrasado × mês passado", oferecer **atalhos prontos** (presets) para o gestor não precisar montar datas na mão:
- Mês passado × mês retrasado
- Últimos 30 dias × 30 dias anteriores
- Este mês × mesmo mês do ano anterior

A visualização "intuitiva" pede: número grande do período atual, número menor do período de referência, e um **delta com cor e seta** (ex.: ▲ +12% verde / ▼ −8% vermelho), além dos gráficos de distribuição sobrepostos ou lado a lado.

## Mudanças técnicas por camada

### Banco
- Criar índice para suportar o filtro de período sem varредura completa:
  ```sql
  CREATE INDEX idx_feedback_enterprise_created_at
    ON public.feedback (enterprise_id, created_at DESC);
  ```
  Versionar em `database/sql/` (mesmo padrão dos arquivos de tabela). Avaliar índice incluindo `collection_point_id` se o filtro por escopo dominar as consultas.

### API Gateway
- Em `getFeedbacksStatsController` (`feedbacks.controller.ts`): ler `start_date`/`end_date` da query, validar e aplicar `.gte('created_at', ...)` / `.lte('created_at', ...)` na consulta Supabase (filtro no **SQL**, não em JS).
- **Extrair a lógica de cálculo para um helper reutilizável** (recebe filtros, devolve `FeedbackStats`). Isso habilita a comparação chamando o helper duas vezes.
- Para a comparação, escolher entre:
  - **Estender** `/stats` aceitando um segundo intervalo, ou
  - **Nova rota** `GET /api/protected/user/feedbacks/stats/comparison` retornando `{ periodoA, periodoB, deltas }`. *(Recomendado: rota separada, mantém o contrato de `/stats` simples.)*

### Contratos / tipos
- Estender o tipo de opções de stats (em `shared/interfaces/domain/feedback.domain.ts`) com `start_date?`/`end_date?`.
- Criar um tipo `FeedbackStatsComparison` (`periodoA`, `periodoB`, `deltas`) em `shared/`.

### Frontend
- `serviceFeedbacks.ts`: repassar `start_date`/`end_date`; nova função para a comparação.
- Novo componente seletor de período (ex.: `apps/web/components/user/pages/dashboard/DateRangeSelector.tsx`) com os presets.
- Novo bloco de comparação (ex.: `SectionComparisonMetrics.tsx`) com os cards e deltas.
- Integrar com o contexto de escopo existente (`insightsControls`) para que período e escopo combinem.
- Avaliar uma lib leve de datas (ex.: `date-fns`) — verificar antes se já há algo no `apps/web/package.json` (hoje há util próprio `apps/web/src/lib/utils/FormatDate.ts`).

## Riscos e decisões em aberto

- **Performance / índice:** sem o índice em `created_at`, filtros de período fazem varredura. Criar o índice **antes** de liberar a feature.
- **Agregação em JS:** hoje os números são contados no frontend/JS após buscar as linhas. Para grandes volumes, migrar para agregação em SQL (`count ... group by rating`) — não é bloqueante agora, mas anotar.
- **Fuso horário:** definir se o intervalo é interpretado no fuso do gestor ou em UTC. `created_at` é `timestamptz`. Decidir e documentar para os "presets" baterem com a expectativa ("mês passado" segundo quem?).
- **Insights de IA × período:** o `feedback_insights_report` (texto gerado pela IA) **não é segmentado por data** hoje. Comparar períodos vale para as **métricas quantitativas**; comparar os **insights textuais** por período seria um trabalho separado (exigiria gerar/armazenar insights por janela de tempo).
- **Empty states:** período sem feedbacks deve mostrar estado vazio claro, e a comparação deve lidar com "período de referência sem dados" (divisão por zero no cálculo do delta).

## Esboço de fases

1. **Fase 1 — Período (leitura):** índice + filtro `start_date`/`end_date` no endpoint + seletor de período no dashboard. Entrega valor sozinho.
2. **Fase 2 — Comparação:** helper reutilizável no backend + rota/tipo de comparação + bloco visual com deltas e presets.
3. **Fase 3 — Polimento:** presets adicionais, gráficos sobrepostos, exportação, e (se necessário) migração da agregação para SQL.
