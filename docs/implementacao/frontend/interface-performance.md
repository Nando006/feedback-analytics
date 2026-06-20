# Frontend — Interface e Performance

Este documento cobre como o frontend se comporta em runtime: estratégias de carregamento, resposta a inputs, estados visuais e fluxos orientados à conversão do usuário.

---

## Carregamento Inteligente

### Fallback de aplicação

Enquanto o roteador hidrata pela primeira vez, o `FallbackType01` é exibido — uma tela neutra com texto "Carregando..." que impede o usuário de ver uma tela em branco.

### Skeletons por rota

Cada tela com dados remotos tem seu próprio componente de skeleton, que espelha o layout real da página com blocos animados (`animate-pulse` via `SkeletonBlock`). O skeleton é exibido enquanto o loader da rota executa.

Exemplos implementados:

| Tela | Skeleton |
|---|---|
| Dashboard | `DashboardSkeleton` |
| Feedbacks | `FeedbacksAllSkeleton` |
| Detalhe de feedback (`/user/feedbacks/:id`) | `FeedbackDetailsSkeleton` |
| Insights (Report) | `InsightsReportSkeleton` |
| Insights (Emocional) | `InsightsEmotionalSkeleton` |
| Insights (Estatísticas) | `InsightsStatisticsSkeleton` |
| Perfil | `ProfileSkeleton` |
| QR Code Empresa | `QrCodeEnterpriseSkeleton` |
| QR Code Catálogo | `QrCodeProductsSkeleton`, `QrCodeServicesSkeleton`, `QrCodeDepartmentsSkeleton` |
| Edição (Configurações) | `EditFeedbackSettingsSkeleton` |

### Lazy loading de imagens

Imagens de QR Code e itens de catálogo usam `loading="lazy"` e `decoding="async"` nativos do browser, evitando que imagens fora da viewport bloqueiem a renderização inicial.

### Code splitting por rota

> **Pendente:** o suporte a lazy loading de rotas via `lazy: () => import(...)` está preparado no roteador (`source.tsx` tem a linha comentada), mas ainda não está ativado. Quando implementado, cada rota carregará seu bundle apenas quando acessada.

---

## Tratamento de Inputs e Eventos

> **Pendente:** debounce e throttle ainda não estão implementados no projeto. Os campos de busca e filtros em `/user/feedbacks/all` realizam operações síncronas. A recomendação para implementação futura é:
>
> - **Busca por texto:** debounce de 300–400ms antes de aplicar o filtro local ou disparar requisição
> - **Ações repetitivas (ex: clique em botão de ação):** throttle para evitar duplo envio

---

## Estados da Tela

Todo fluxo de dados no frontend prevê 4 estados visuais distintos. A ausência de qualquer um deles é considerada incompleta.

### Loading — Skeletons

Blocos animados que espelham o layout da página real. Implementados via `SkeletonBlock` (componente base) composto em skeletons específicos por tela. O padrão visual usa `animate-pulse` com a variável `--seventh-color`.

### Sucesso — Dados na tela

Estado padrão: o componente da página recebe os dados do loader e os renderiza normalmente.

### Vazio — Empty State

Exibido quando a requisição foi bem-sucedida mas não há dados. Cada tela com esse cenário tem seu próprio componente `*EmptyState.tsx` com mensagem contextual.

Exemplo de comportamento inteligente em `FeedbacksAllEmptyState`: a mensagem muda dependendo se há filtros ativos ou não — "Tente ajustar os filtros" vs. "Ainda não há feedbacks registrados".

### Erro — Error State

Exibido quando o loader ou a action retorna uma falha. Cada tela tem seu `*ErrorState.tsx` com estilo visual distinto (bordas e fundo em `rose-500`) para sinalizar claramente o problema.

### Resumo por feature

| Feature | Loading | Vazio | Erro |
|---|---|---|---|
| Feedbacks (lista) | `FeedbacksAllSkeleton` | `FeedbacksAllEmptyState` | `FeedbacksAllErrorState` |
| Analytics Geral | `FeedbacksAnalyticsAllSkeleton` | `AnalyticsAllEmptyState` | `AnalyticsAllErrorState` |
| Analytics Positivo | `FeedbacksAnalyticsPositiveSkeleton` | `AnalyticsPositiveEmptyState` | `AnalyticsPositiveErrorState` |
| Analytics Negativo | `FeedbacksAnalyticsNegativeSkeleton` | `AnalyticsNegativeEmptyState` | `AnalyticsNegativeErrorState` |
| Insights (Report) | `InsightsReportSkeleton` + `InsightsReportLoadingState` | `InsightsReportEmptyState` | `InsightsReportErrorState` |
| Insights (Emocional) | `InsightsEmotionalSkeleton` | `InsightsEmotionalEmptyState` | `InsightsEmotionalErrorState` |
| Insights (Estatísticas) | `InsightsStatisticsSkeleton` | `InsightsStatisticsEmptyState` | `InsightsStatisticsErrorState` |

> **Nota:** Insights (Report) tem dois estados de loading: o skeleton de rota (`InsightsReportSkeleton`) e um estado inline (`InsightsReportLoadingState`) exibido durante a geração assíncrona do relatório via IA — são momentos distintos.

---

## Componentes Focados em Conversão

O frontend tem dois fluxos críticos orientados à ação do usuário: ativação de recursos Premium e coleta de feedback via QR Code.

### Ativação de tipos Premium (`/user/edit/types-feedback`)

Permite à empresa ativar tipos de feedback disponíveis no plano Premium. O fluxo é direto: visualizar os tipos disponíveis → ativar/desativar com feedback visual imediato via toast de confirmação.

### Geração e compartilhamento de QR Codes

Fluxo: perfil da empresa → gerar QR Code → compartilhar link ou imagem. Cada catálogo (produtos, serviços, departamentos) tem sua própria rota de QR Code, permitindo campanhas segmentadas.

### Formulário público de coleta (`/feedback/qrcode`)

A tela que o cliente final vê ao escanear o QR Code. Tem estados visuais dedicados para cada momento:

| Estado | Componente |
|---|---|
| Carregando dados da empresa | `stateLoading` |
| Formulário disponível | `PublicQrFeedbackTemplateRenderer` |
| Feedback já enviado anteriormente | `stateSentPreviousFeedback` |
| Enviado com sucesso | `stateSubmitted` |
| Erro (empresa não encontrada etc.) | `stateError` |

O formulário público é o ponto de entrada de dados do produto — cada atrito removido aqui impacta diretamente o volume de feedbacks coletados.

---

## Veja Também

- [Visão Geral](./visao-geral.md)
- [Arquitetura e Estrutura](./arquitetura-estrutura.md)
- [System Design](./system-design.md)
