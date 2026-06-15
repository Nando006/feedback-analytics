# 04 — Configurador de coleta com preview ao vivo

| Campo | Valor |
|---|---|
| **Status** | 🔵 Fase 1 entregue (Feedback geral) · Fases 2–3 pendentes |
| **Esforço estimado** | Médio-Alto |
| **Camadas afetadas** | Frontend (telas de configuração de coleta) |
| **Inspiração** | `HomepageBuilder` do projeto `urbo-transparencia` (construtor de página inicial com preview ao vivo) |

## Objetivo

Configurar a coleta hoje é "às cegas": o gestor edita perguntas e não vê o resultado. A meta é **"configura e vê ao mesmo tempo"** — um **preview ao vivo do formulário público** ao lado do editor, atualizando conforme ele edita. Aplicar em **todas** as telas de configuração de coleta que afetam o formulário.

## Conceito adaptado (o que trazer do urbo, o que descartar)

A referência (`HomepageBuilder`) é um page builder de seções livres com 3 painéis (paleta → preview → propriedades), schema-driven, drag-and-drop e *stubs* de preview. **Trazemos só a essência:**

**Trazer:**
- **Preview ao vivo lado a lado** (esquerda = editor, direita = formulário como o cliente verá). É o coração do pedido.
- **Estado central + derivação por render:** o preview NÃO tem cópia dos dados — lê o mesmo `useState` do editor, convertido na hora via `useMemo`. Sincronização zero-lag.
- **Reusar o componente real** (`FormQRCodeFeedback`) em vez de criar *stubs*. O urbo usou stubs porque as seções eram pesadas e sem dados; aqui o formulário já é leve e fiel — reusá-lo dá 100% de fidelidade sem risco de "drift".

**Descartar (honestamente):**
- **Page builder de seções livres / paleta / `SECTION_CONFIGS`:** nosso formulário tem **estrutura fixa e guiada** (nota Likert → perguntas → mensagem → cliente). Não há "adicionar bloco".
- **Schema-driven completo:** over-engineering — só existe **um** tipo de campo composto (pergunta + 3 subperguntas). Não há variedade de campos que justifique um motor genérico.
- **Drag-and-drop de reordenar perguntas:** ordem é fixa 1–3 e posicional. Baixo retorno; se um dia precisar, setas ↑/↓ bastam.
- **Stubs e upload de imagem:** não se aplicam.

## Aplicação por tela

| Tela | Preview? | Como |
|---|---|---|
| **Feedback geral** (perguntas COMPANY) — `editFeedbackGeneral.tsx` | ✅ **Prioridade** | Split `lg:grid-cols-2`: editor à esquerda, preview (sticky) à direita. 1 só conjunto de perguntas → preview "da tela". |
| **Catálogo por item** — `QuestionAccordion` em `fieldCatalogItems.tsx` | ✅ | Preview **full-width dentro do acordeão aberto** (cada item tem perguntas próprias; o card é estreito demais p/ split lateral). |
| **Dados da empresa** — `editCompanyData.tsx` | ❌ | Contexto p/ IA (objetivo/resumo/meta) **não aparece** no formulário do cliente. Nada a pré-visualizar. |
| **Catálogo (tipos)** — `formTypesFeedback.tsx` | ❌ | Só toggles de quais catálogos existem. |

## Arquitetura técnica

1. **Util de conversão** — criar `apps/web/src/lib/utils/mapEditorQuestionsToPublic.ts`: converte o estado do editor (`CompanyFeedbackQuestionInput[]` / `QrCatalogQuestionInput[]`) → `FeedbackQuestionPublic[]` (contrato que o form consome). Parâmetros: `scopeType`, `catalogItemId`, `idPrefix`, e **`activeFromText`** (catálogo deriva `is_active` do texto; COMPANY respeita o toggle — espelhar a regra do save para o preview não enganar). Filtra perguntas vazias/inativas, cunha `id` sintético estável. Reusar `getActiveSubquestions`/`getSortedQuestions` de `publicQrFeedbackForm.ts` (não duplicar).
2. **PreviewPanel** — criar `apps/web/components/user/pages/profile/preview/feedbackFormPreview.tsx`: monta um **view-model simulado** (`PublicQrFeedbackFormViewModel`, `ui.types.ts:97-100`) e renderiza `FormQRCodeFeedback` diretamente — **sem** `useQrCodeFeedbackController` (que acopla fetch/toast) e **sem** o template renderer. `state.questions = useMemo(map..., [editorQuestions])`; `actions.submit = e => e.preventDefault()` (neutraliza o `required` do textarea/submit). State local leve para a nota/respostas deixa o preview **interativo** (gestor clica e sente como o cliente), sem persistir nada. Rotular **"Prévia — não enviada"**.
3. **Tema (resolvido):** envolver o preview em **`<div className="public-theme">`** — essa classe (em `styles/index.css:46`) já redefine `--primary-color` etc. com as cores do tema público, então o preview fica fiel mesmo dentro do `private-user-theme`.
4. **Responsividade:** desktop ≥`lg` = split 2 colunas (padrão `grid grid-cols-1 gap-8 lg:grid-cols-2` que já existe em `editFeedbackGeneral.tsx`), preview `lg:sticky`. Mobile = botão **"Ver prévia"** (no slot `actions` do `PageHeader`) abre **modal/drawer** — não empilhar.
5. **Persistência inalterada:** o preview é puramente visual e efêmero (zero rede). O save continua como hoje; o preview lê o mesmo state que já é serializado → "o que se vê é o que se salva".

## Unificar o editor de perguntas (Fase 3)

Há **duplicação real**: `questionDinamicEnterprise.tsx` (COMPANY) e o `QuestionAccordion` de `fieldCatalogItems.tsx` têm modelo idêntico (3 perguntas × 3 subperguntas), helpers quase linha-a-linha e markup copiado. Unificar em: **`<QuestionItem>`** (markup do item) + **`<QuestionsEditor>`** (orquestrador controlado) + helpers compartilhados, parametrizados por flags (`allowVariableQuestionCount`, `activeFromText`, `validate`). O mesmo `PreviewPanel` consome a saída de ambos. É a peça de **maior risco** (toca o save de 2 telas) → por último.

## Reuso vs criação

- **Reaproveitar:** `formQRCodeFeedback.tsx` + os 6 fields; `PublicQrFeedbackFormViewModel` (`ui.types.ts:97`); contrato `FeedbackQuestionPublic` (`question.contract.ts`); `publicQrFeedbackForm.ts` (filtragem/ordenação); a classe `.public-theme`; o padrão de grid de `editFeedbackGeneral.tsx`.
- **Não reusar:** `useQrCodeFeedbackController` (acopla fetch/toast) e `PublicQrFeedbackTemplateRenderer` (exige `scope`).
- **Criar:** `mapEditorQuestionsToPublic.ts` (+ teste); `feedbackFormPreview.tsx`; (Fase 3) `QuestionItem`/`QuestionsEditor` + helpers.

## Fases e riscos

1. **Fase 1 — Util + Preview em Feedback geral (lado a lado + modal mobile):** ✅ **ENTREGUE.** Criados `src/lib/utils/mapEditorQuestionsToPublic.ts` (+7 testes), `components/user/pages/profile/preview/feedbackFormPreview.tsx` (reusa `FormQRCodeFeedback` real com view-model simulado, interativo, envolto em `.public-theme`), plugado em `questionDinamicEnterprise.tsx` com split `lg:grid-cols-2` (editor | preview sticky) + botão "Ver prévia"/modal no mobile.
2. **Fase 2 — Preview no Catálogo por item:** `PreviewPanel` full-width dentro do `QuestionAccordion` (`activeFromText: true`).
3. **Fase 3 — Unificar o editor de perguntas** (maior risco, por último; migrar tela a tela verificando paridade do payload).

**Riscos:** fidelidade do `is_active` no catálogo (mitigado por `activeFromText`); `textarea required` do `FieldMessage` (mitigado por `submit=preventDefault`); perguntas incompletas enquanto digita (util oculta texto vazio); Fase 3 toca save de produção (por último, com verificação). Tema **já resolvido** via `.public-theme`.
