# 02 — Feedback por áudio (configurável)

| Campo | Valor |
|---|---|
| **Status** | 🟡 Planejado |
| **Esforço estimado** | Alto |
| **Camadas afetadas** | Frontend (formulário público) · API Gateway · Banco · Supabase Storage · IA Analyze |
| **Depende de** | Implementar Supabase Storage · decisão sobre transcrição de áudio |

> Frentes relacionadas (configuração do formulário pelo gestor): [item 04 — Preview do formulário](./04-preview-do-formulario.md) e [item 03 — Reorganização das telas](./03-reorganizacao-das-telas-de-configuracao.md).

## Objetivo

Permitir que o cliente **grave um áudio** com sua opinião **no lugar do campo de texto** ("Conte-nos mais sobre sua experiência"). A escolha entre **texto** e **áudio** é do **gestor**, por configuração — o objetivo maior é tornar o formulário montável do jeito que o gestor decidir.

## Como funciona hoje

- O formulário público é montado em `apps/web/components/public/forms/formQRCodeFeedback.tsx`, com os campos em `apps/web/components/public/forms/fields/fieldsQRCode/` (`fieldRating`, `fieldDynamicQuestions`, `fieldMessage`, `fieldCustomer*`).
- O campo de descrição é **sempre** um `textarea` (`fieldMessage.tsx`); a mensagem é validada em `shared/schemas/public/feedbackSchema.ts` como `message: z.string().min(3).max(5000)` — **obrigatória**.
- Persistência: `backends/api-gateway/src/controllers/public/qrcode.controller.ts` grava na tabela `feedback`, cuja coluna `message` é `text NOT NULL` (`database/sql/tables/public.feedback.sql`). **Não há** coluna de áudio nem de "tipo de mensagem".
- **Supabase Storage não está implementado** — não há bucket no `database/sql/`, nem nenhuma chamada `.storage` no código.
- Pipeline de IA: `services/ia-analyze` recebe o **texto** de `message` e monta o prompt em `iaAnalyzePromptBuilders.ts` (`message_primary: feedback.message`). O provider (`gemini.provider.ts`) chama `gemini-2.5-flash` via `@google/genai` enviando **apenas texto** hoje.

## Proposta

1. **Configuração do gestor:** uma opção por formulário/escopo do tipo "Tipo de resposta aberta: **Texto** | **Áudio** | **Cliente escolhe**". Persistir essa preferência (ver "Banco").
2. **Formulário público:** quando o modo for áudio, renderizar um **gravador** (MediaRecorder do navegador) no lugar do textarea, com limites claros (duração mín./máx.).
3. **Upload:** enviar o arquivo de áudio para um bucket do Supabase Storage e guardar a **URL/caminho** no feedback.
4. **Análise:** transcrever o áudio para texto e alimentar o pipeline de IA existente (sentimento/keywords/categorias continuam funcionando sobre o texto transcrito).

## Mudanças técnicas por camada

### Banco
- Em `feedback`: adicionar `message_type text` (`'TEXT' | 'AUDIO'`), `audio_path text` (caminho no Storage) e, opcionalmente, `audio_duration_seconds int` e `transcription text`. Tornar `message` **anulável** quando o tipo for áudio (hoje é `NOT NULL`) — ou guardar a transcrição em `message`.
- Onde o gestor configura o modo: avaliar uma coluna em `collecting_data_enterprise` (modo global) e/ou por item de catálogo (`catalog_items`/`questions_of_feedbacks`), conforme a granularidade desejada.
- Ajustar as **RLS policies** de insert anônimo da tabela `feedback` para o novo formato.

### Supabase Storage (infra nova)
- Criar bucket (ex.: `feedback-audio`) com policy permitindo **insert anônimo** (o cliente não está logado), idealmente via **upload com URL assinada** gerada pelo Gateway para limitar abuso.
- Definir limites: tamanho máximo (ex.: ~5 MB ≈ 1 min), formatos aceitos, e política de retenção.

### Frontend público
- Novo campo `fieldAudioMessage.tsx` (gravar / regravar / ouvir antes de enviar), com fallback para texto quando o navegador não suportar `MediaRecorder`.
- `formQRCodeFeedback.tsx` passa a renderizar `FieldMessage` **ou** `FieldAudioMessage` conforme a configuração recebida.
- Ajustar o controller do formulário (`apps/web/pages/public/qrcode/useQrCodeFeedbackController.ts`) e o schema Zod para o payload com áudio.

### API Gateway
- `qrcode.controller.ts`: aceitar o upload (ou a URL assinada já enviada), validar tamanho/tipo, gravar `message_type`/`audio_path` no feedback.

### IA Analyze (transcrição)
Duas opções — **decisão em aberto**:
- **Opção 1 — Usar o próprio Gemini (multimodal).** O `gemini-2.5-flash` já em uso **aceita áudio nativamente** via `@google/genai` (parte `inlineData`/`fileData`). Dá para transcrever (e até analisar) o áudio no mesmo serviço, sem novo fornecedor — bastaria estender `gemini.provider.ts` para enviar o áudio junto. Atenção ao custo (tokens de áudio) e à latência.
- **Opção 2 — Serviço de Speech-to-Text dedicado** (Google Speech-to-Text, Whisper, Deepgram): transcreve antes e o pipeline atual segue intacto. Mais peças, custo separado.
- Em ambos: definir o **fallback** se a transcrição falhar (descartar? guardar áudio sem análise? marcar para retry?).

## Riscos e decisões em aberto

- **Infra nova obrigatória:** Storage precisa existir antes de qualquer coisa. É o maior pré-requisito.
- **Custo:** áudio multimodal no Gemini ou STT dedicado adicionam custo recorrente — estimar por volume esperado.
- **Qualidade de transcrição:** sotaques, ruído de ambiente (coleta presencial!), português-BR.
- **Privacidade/LGPD:** áudio é dado pessoal mais sensível que texto. Revisar consentimento, retenção e a [higienização já documentada](../docs/funcionalidades/higienizacao-jwt-lgpd.md).
- **Acessibilidade/compatibilidade:** `MediaRecorder` varia por navegador/iOS; ter fallback para texto.
- **Tamanho do contrato:** mexer no `feedbackSchema` é breaking change para o formulário público — versionar com cuidado.

## Esboço de fases

1. **Fase 0 — Storage:** implementar bucket + URL assinada + policies (vale para outros usos, ex.: logo da empresa).
2. **Fase 1 — Captura e guarda:** gravador no formulário + upload + colunas no banco + flag de configuração. O áudio fica gravado e ouvível, **sem IA ainda**.
3. **Fase 2 — Transcrição + IA:** transcrever (opção escolhida) e plugar no pipeline existente.
4. **Fase 3 — Polimento:** limites, retry, métricas de falha de transcrição, escolha "cliente decide".
