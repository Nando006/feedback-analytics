# 04 — Preview ao vivo do formulário na configuração

| Campo | Valor |
|---|---|
| **Status** | 🟡 Planejado |
| **Esforço estimado** | Médio |
| **Camadas afetadas** | Frontend (telas de configuração) |
| **Depende de** | — (anda junto com o [item 03 — Reorganização das telas](./03-reorganizacao-das-telas-de-configuracao.md)) |

> Esta frente nasceu junto da do [item 02 — Feedback por áudio](./02-feedback-por-audio.md) (ambas mexem no formulário), mas é independente: foca na **experiência do gestor** ao configurar, não na coleta do cliente.

## Objetivo

Hoje configurar o formulário é **"rústico"**: o gestor edita perguntas/itens em uma tela e não vê o resultado. A proposta é mostrar um **preview do formulário ao lado da configuração**, atualizado em tempo real conforme ele edita — "configura e vê ao mesmo tempo".

## Como funciona hoje

- A configuração está espalhada (ver também o [item 03](./03-reorganizacao-das-telas-de-configuracao.md)):
  - Perguntas globais da empresa: `apps/web/components/user/pages/profile/questionsDinamic/questionDinamicEnterprise.tsx` (dentro de `/user/profile`).
  - Perguntas por item de catálogo: dentro de `apps/web/components/user/pages/profile/editCollectingData/fields/fieldCatalogItems.tsx` (componente `QuestionAccordion`).
  - Catálogo: `apps/web/components/user/pages/profile/editFeedbackSettings/formFeedbackCatalog.tsx`.
- O componente que renderiza o formulário real do cliente (`formQRCodeFeedback.tsx`) **já é isolado e reutilizável** — é exatamente o que o preview precisa.

## Proposta

- Layout em duas colunas no editor: **esquerda** = controles de configuração; **direita** = `FormQRCodeFeedback` em modo **somente leitura** (submit desabilitado), alimentado por um **estado simulado** montado a partir do que o gestor está editando.
- Conforme o gestor digita/ativa perguntas, o preview re-renderiza. Reaproveitar exatamente os componentes e classes CSS do formulário público garante fidelidade visual.

## Mudanças técnicas

- Criar um util que converte o estado do editor (perguntas/subperguntas/itens) no formato que `FormQRCodeFeedback` espera (ex.: `apps/web/src/lib/utils/previewQrFeedbackState.ts`).
- Criar um painel de preview (ex.: `PreviewPanel.tsx`) que envolve `FormQRCodeFeedback` em modo read-only.
- Encaixar o painel nas telas de configuração (idealmente junto da reorganização do [item 03](./03-reorganizacao-das-telas-de-configuracao.md)).

## Riscos e decisões em aberto

- **Estado independente:** o estado do preview (rating/respostas de exemplo) não pode interferir no formulário de edição.
- **Responsividade:** as telas de config já são usadas em telas pequenas; em mobile o preview pode virar um botão "Ver prévia" (modal) em vez de coluna fixa.
- **Sincronia com áudio (item 02):** quando o modo áudio do [item 02](./02-feedback-por-audio.md) existir, o preview deve refletir o gravador também.

## Esboço de fases

1. **Fase 1 — Preview estático:** botão "Ver prévia" abre o formulário montado com a config atual.
2. **Fase 2 — Preview ao vivo:** atualização em tempo real ao editar, lado a lado (desktop) / modal (mobile).
